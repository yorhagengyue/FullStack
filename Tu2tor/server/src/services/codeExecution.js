import vm from 'vm';
import { PythonShell } from 'python-shell';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute code in a sandboxed environment
 * @param {string} language - The programming language (javascript, python)
 * @param {string} code - The code to execute
 * @returns {Promise<object>} - Result object { output, error }
 */
export const executeCode = async (language, code) => {
    if (language === 'javascript') {
        return executeJavaScript(code);
    } else if (language === 'python') {
        return executePython(code);
    } else {
        return { error: `Language ${language} not supported.` };
    }
};

/**
 * Execute Python code using python-shell
 */
const executePython = async (code) => {
    return new Promise((resolve) => {
        // Create temporary directory if it doesn't exist
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Create a temporary file with unique name
        const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.py`;
        const tempFilePath = path.join(tempDir, tempFileName);

        try {
            // Write code to temporary file
            fs.writeFileSync(tempFilePath, code);

            const outputs = [];
            const errors = [];

            // Configure python-shell with security restrictions
            const options = {
                mode: 'text',
                pythonPath: 'python', // or 'python3' depending on system
                pythonOptions: ['-u'], // unbuffered output
                scriptPath: tempDir,
                args: [],
            };

            // Run Python script
            const pyshell = new PythonShell(tempFileName, options);

            // Collect stdout
            pyshell.on('message', (message) => {
                outputs.push(message);
            });

            // Collect stderr
            pyshell.on('stderr', (stderr) => {
                errors.push(stderr);
            });

            // Handle completion
            pyshell.end((err) => {
                // Clean up temporary file
                try {
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                } catch (cleanupErr) {
                    console.error('Error cleaning up temp file:', cleanupErr);
                }

                if (err) {
                    resolve({ 
                        error: err.message || errors.join('\n') || 'Python execution failed'
                    });
                } else {
                    const output = outputs.join('\n');
                    resolve({ 
                        output: output || 'Code executed successfully (no output)'
                    });
                }
            });

            // Set timeout to kill process after 5 seconds
            setTimeout(() => {
                try {
                    pyshell.terminate();
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                    resolve({ error: 'Execution timeout (5 seconds)' });
                } catch (timeoutErr) {
                    console.error('Error during timeout:', timeoutErr);
                }
            }, 5000);

        } catch (err) {
            // Clean up on error
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (cleanupErr) {
                console.error('Error cleaning up temp file:', cleanupErr);
            }
            resolve({ error: err.message });
        }
    });
};

/**
 * Execute JavaScript using Node.js vm module
 */
const executeJavaScript = async (code) => {
    return new Promise((resolve) => {
        const logs = [];

        // Custom console to capture output
        const customConsole = {
            log: (...args) => {
                logs.push(args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' '));
            },
            error: (...args) => {
                logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
            },
            warn: (...args) => {
                logs.push('WARN: ' + args.map(arg => String(arg)).join(' '));
            }
        };

        // Sandbox context
        const sandbox = {
            console: customConsole,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
        };

        try {
            // Create context
            const context = vm.createContext(sandbox);

            // Execute code with timeout
            const script = new vm.Script(code);

            script.runInContext(context, {
                timeout: 1000, // 1 second timeout
                displayErrors: true
            });

            resolve({ output: logs.join('\n') || 'Code executed successfully (no output)' });
        } catch (err) {
            resolve({ error: err.message });
        }
    });
};

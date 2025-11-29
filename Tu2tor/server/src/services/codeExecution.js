import vm from 'vm';

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
        return { error: 'Python execution not yet implemented on backend.' };
    } else {
        return { error: `Language ${language} not supported.` };
    }
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

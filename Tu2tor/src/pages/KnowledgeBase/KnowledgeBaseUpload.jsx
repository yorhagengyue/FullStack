import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { knowledgeBaseAPI } from '../../services/api';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw,
  BookOpen,
  Tag,
  Calendar,
  FileType,
} from 'lucide-react';

const KnowledgeBaseUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subjects } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, documentId: null });
  const [dragActive, setDragActive] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Fetch uploaded documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  // 轮询检查处理中的文档
  useEffect(() => {
    const processingDocs = documents.filter(
      doc => doc.processingStatus?.status === 'processing' || doc.processingStatus?.status === 'pending'
    );

    if (processingDocs.length > 0) {
      // 启动轮询
      const interval = setInterval(async () => {
        for (const doc of processingDocs) {
          try {
            const statusResponse = await knowledgeBaseAPI.getStatus(doc._id);
            if (statusResponse.success) {
              // 更新文档状态
              setDocuments(prevDocs =>
                prevDocs.map(d =>
                  d._id === doc._id
                    ? { ...d, processingStatus: statusResponse.processingStatus }
                    : d
                )
              );
            }
          } catch (error) {
            console.error(`Failed to fetch status for ${doc._id}:`, error);
          }
        }
      }, 3000); // 每3秒检查一次

      setPollingInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      // 清除轮询
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [documents]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await knowledgeBaseAPI.list({ sortBy: 'uploadedAt', sortOrder: 'desc' });
      if (response.success) {
        setDocuments(response.documents || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      setToast({
        isOpen: true,
        message: 'Unsupported file type. Please upload PDF, PPTX, DOCX, or images.',
        type: 'error'
      });
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setToast({
        isOpen: true,
        message: 'File size exceeds 50MB limit.',
        type: 'error'
      });
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setToast({ isOpen: true, message: 'Please select a file', type: 'error' });
      return;
    }

    if (!selectedSubject) {
      setToast({ isOpen: true, message: 'Please select a subject (ID required)', type: 'error' });
      return;
    }

    if (!title.trim()) {
      setToast({ isOpen: true, message: 'Please enter a title', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const metadata = {
        description: description.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        visibility
      };

      const response = await knowledgeBaseAPI.upload(
        selectedFile,
        selectedSubject,
        title.trim(),
        metadata
      );

      if (response.success) {
        setToast({
          isOpen: true,
          message: 'Document uploaded successfully! Processing in background...',
          type: 'success'
        });

        // Reset form
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setTags('');
        
        // Refresh documents list
        fetchDocuments();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setToast({
        isOpen: true,
        message: error.message || 'Failed to upload document',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await knowledgeBaseAPI.delete(documentId);
      setToast({ isOpen: true, message: 'Document deleted successfully', type: 'success' });
      fetchDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
      setToast({ isOpen: true, message: 'Failed to delete document', type: 'error' });
    }
  };

  const handleRetry = async (doc) => {
    // 重新上传失败的文档
    setToast({
      isOpen: true,
      message: `Retrying upload for "${doc.title}"...`,
      type: 'info'
    });

    try {
      // 删除旧文档
      await knowledgeBaseAPI.delete(doc._id);
      
      setToast({
        isOpen: true,
        message: 'Failed document deleted. Please upload a new file.',
        type: 'success'
      });
      
      fetchDocuments();
    } catch (error) {
      console.error('Retry failed:', error);
      setToast({
        isOpen: true,
        message: 'Failed to retry. Please delete and re-upload manually.',
        type: 'error'
      });
    }
  };

  const getFileIcon = (type) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (type === 'pptx') return <File className="w-5 h-5 text-orange-500" />;
    if (type === 'docx') return <FileText className="w-5 h-5 text-blue-500" />;
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" />, text: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, documentId: null })}
        onConfirm={() => {
          handleDelete(confirmDialog.documentId);
          setConfirmDialog({ isOpen: false, documentId: null });
        }}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Knowledge Base</h1>
          </div>
          <p className="text-gray-600">Upload and manage your study materials for AI-powered learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Upload Material
              </h2>

              {/* File Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept=".pdf,.pptx,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-700 font-medium">Drop file here or click to browse</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, PPTX, DOCX, or Images (Max 50MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject, idx) => {
                      const value = subject._id || subject.id || subject.subjectId;
                      return (
                        <option key={value || idx} value={value || ''}>
                        {subject.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Week 3 Lecture Notes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Brief description of the material..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., lecture, midterm, important"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="private">Private (Only me)</option>
                    <option value="public">Public (Everyone)</option>
                  </select>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedSubject || !title.trim() || uploading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Material
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  My Materials ({documents.length})
                </h2>
                <button
                  onClick={fetchDocuments}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading && documents.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No materials uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-2">Upload your first document to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id || doc.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                            {getStatusBadge(doc.processingStatus?.status || 'pending')}
                          </div>

                          {doc.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{doc.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileType className="w-3 h-3" />
                              {doc.type.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                            {doc.extractedContent?.wordCount && (
                              <span>{doc.extractedContent.wordCount.toLocaleString()} words</span>
                            )}
                          </div>

                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {(doc.processingStatus?.status === 'processing' || doc.processingStatus?.status === 'pending') && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {doc.processingStatus.currentStep || doc.processingStatus.stage || 'Processing'}
                                </span>
                                <span className="text-gray-600 font-semibold">{doc.processingStatus.progress || 0}%</span>
                              </div>
                              {doc.processingStatus.message && (
                                <p className="text-xs text-gray-500 mb-1">{doc.processingStatus.message}</p>
                              )}
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${doc.processingStatus.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {doc.processingStatus?.status === 'failed' && (
                            <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs">
                              <p className="font-medium text-red-700">Error: {doc.processingStatus.message || 'Processing failed'}</p>
                              {doc.processingStatus.error && (
                                <p className="mt-1 text-red-600 font-mono text-xs">{doc.processingStatus.error}</p>
                              )}
                              <button
                                onClick={() => handleRetry(doc)}
                                className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Delete & Re-upload
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.processingStatus?.status === 'completed' && (
                            <button
                              onClick={() => navigate(`/app/knowledge-base/${doc._id}`)}
                              className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                              title="View content"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDialog({ isOpen: true, documentId: doc._id })}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseUpload;


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
  Plus,
  Search,
  Filter
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

        // Reset form and close modal
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setTags('');
        setShowUploadModal(false);
        
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
    if (type === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (type === 'pptx') return <File className="w-8 h-8 text-orange-500" />;
    if (type === 'docx') return <FileText className="w-8 h-8 text-blue-500" />;
    if (type === 'image') return <ImageIcon className="w-8 h-8 text-purple-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Queueing' },
      processing: { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Processing' },
      completed: { color: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle className="w-3 h-3" />, text: 'Ready' },
      failed: { color: 'bg-red-50 text-red-600 border-red-200', icon: <AlertCircle className="w-3 h-3" />, text: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                Knowledge Base
              </h1>
              <p className="text-gray-500 mt-1">Manage and organize your AI-enhanced study materials</p>
            </div>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Material
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search documents by title, description, or tags..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-gray-700 placeholder-gray-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button 
                onClick={fetchDocuments}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                title="Refresh List"
               >
                 <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {loading && documents.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
               <FileText className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 max-w-sm text-center mb-8">
              {searchTerm ? "We couldn't find any documents matching your search." : "Get started by uploading your first study material to the Knowledge Base."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id || doc.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Card Header / Icon Area */}
                <div className="h-32 bg-gray-50 group-hover:bg-indigo-50/50 transition-colors flex items-center justify-center relative">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(doc.processingStatus?.status || 'pending')}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                      {doc.description}
                    </p>
                  )}

                  {/* Processing Progress Bar */}
                  {(doc.processingStatus?.status === 'processing' || doc.processingStatus?.status === 'pending') && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-indigo-600 font-medium">
                          {doc.processingStatus.currentStep || 'Processing...'}
                        </span>
                        <span className="text-gray-500">{doc.processingStatus.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${doc.processingStatus.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex-1">
                     <div className="flex flex-wrap gap-1.5 mb-4">
                      {doc.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium uppercase tracking-wide">
                          #{tag}
                        </span>
                      ))}
                      {doc.tags?.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[10px]">+{doc.tags.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FileType className="w-3 h-3" />
                        {doc.type.toUpperCase()}
                     </div>
                     <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {doc.processingStatus?.status === 'completed' && (
                          <button
                            onClick={() => navigate(`/app/knowledge-base/${doc._id}`)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDialog({ isOpen: true, documentId: doc._id })}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Material
              </h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {/* File Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                    : selectedFile
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
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
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                       <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-indigo-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mx-auto transition-colors">
                      <Upload className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">Click to browse or drag file here</p>
                      <p className="text-gray-500 mt-1">Supports PDF, PPTX, DOCX, Images (Max 50MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="private">Private (Only me)</option>
                      <option value="public">Public (Everyone)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g., Week 3 Lecture Notes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    rows={3}
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      placeholder="comma, separated, tags"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !selectedSubject || !title.trim() || uploading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        Start Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseUpload;


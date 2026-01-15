import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { knowledgeBaseAPI } from '../../services/api';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ChunkVisualization from '../../components/knowledge-base/ChunkVisualization';
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
  Filter,
  Layers
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
  const [showChunkModal, setShowChunkModal] = useState(false);
  const [selectedDocumentForChunks, setSelectedDocumentForChunks] = useState(null);

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
      const response = await knowledgeBaseAPI.list({ sortBy: 'createdAt', sortOrder: 'desc' });
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
    if (type === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (type === 'pptx') return <File className="w-4 h-4 text-orange-500" />;
    if (type === 'docx') return <FileText className="w-4 h-4 text-blue-500" />;
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-purple-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-amber-100/80 text-amber-700', 
        dot: 'bg-amber-400',
        text: 'Pending' 
      },
      processing: { 
        color: 'bg-blue-100/80 text-blue-700', 
        dot: 'bg-blue-400 animate-pulse',
        text: 'Processing' 
      },
      completed: { 
        color: 'bg-emerald-100/80 text-emerald-700', 
        dot: 'bg-emerald-400',
        text: 'Ready' 
      },
      failed: { 
        color: 'bg-red-100/80 text-red-700', 
        dot: 'bg-red-400',
        text: 'Failed' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${config.color} shadow-sm`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
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
    <div className="min-h-screen bg-white p-8 font-sans selection:bg-gray-200">
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

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-10">
          <div className="space-y-6">
            {/* Status Bar Pills */}
            <div className="flex items-center gap-3">
               <div className="bg-white rounded-full px-5 py-1.5 border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-semibold text-gray-600">Your Knowledge</span>
                  <div className="w-px h-3 bg-gray-300"></div>
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">{new Date().toLocaleDateString()}</span>
               </div>
               
               <div className="flex h-8 bg-gray-900 rounded-full items-center px-4 gap-2 shadow-lg shadow-gray-200">
                  <div className="flex -space-x-1.5">
                     <div className="w-4 h-4 rounded-full bg-white/20 border border-white/40"></div>
                     <div className="w-4 h-4 rounded-full bg-white/20 border border-white/40"></div>
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wide">AI ACTIVE</span>
               </div>
            </div>

            <h1 className="text-6xl font-light text-gray-900 tracking-tight leading-none">
              KNOWLEDGE<span className="font-bold">BASE</span>
            </h1>
          </div>

          {/* Stats - Minimalist Vertical */}
          <div className="flex gap-16 pt-4 pr-4">
            <div className="text-center group cursor-default">
              <div className="relative">
                <div className="text-5xl font-extralight text-gray-900 mb-1 group-hover:scale-110 transition-transform origin-bottom duration-300">{documents.length}</div>
                <span className="absolute -top-2 -right-4 bg-gray-100 text-[9px] font-bold px-1.5 py-0.5 rounded text-gray-900">Docs</span>
              </div>
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Total</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="relative">
                <div className="text-5xl font-extralight text-gray-900 mb-1 group-hover:scale-110 transition-transform origin-bottom duration-300">
                  {documents.filter(d => d.processingStatus?.status === 'completed').length}
                </div>
                <span className="absolute -top-2 -right-6 bg-black text-[9px] font-bold px-1.5 py-0.5 rounded text-white">Ready</span>
              </div>
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Processed</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl font-extralight text-gray-900 mb-1 group-hover:scale-110 transition-transform origin-bottom duration-300">
                {subjects.length}
              </div>
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Subjects</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-6 w-full lg:w-auto">
             <h2 className="text-3xl font-light text-gray-800 mr-2">
               My Documents <span className="text-sm font-medium text-gray-400 ml-2 align-middle">{documents.length} Files</span>
              </h2>

             {/* Minimalist Search */}
             <div className="group relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm w-64 focus:w-80 transition-all duration-300 outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
                <Filter className="w-3.5 h-3.5" />
             </button>
             
             <div className="flex bg-gray-50 p-1 rounded-full">
                <button 
                   className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                   onClick={fetchDocuments}
                >
                   All
                </button>
                <button className="text-gray-500 px-4 py-1.5 rounded-full text-xs font-medium hover:text-gray-900 transition-colors">
                   Recent
                </button>
             </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-full font-bold text-xs tracking-wide shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            UPLOAD NEW
          </button>
        </div>

        {/* Documents Grid */}
        {loading && documents.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-100 rounded-[2rem]">
             <p className="text-gray-400 font-light text-xl">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDocuments.map((doc, index) => (
              <div
                key={doc._id || doc.id}
                className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-gray-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-black tracking-wider text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                       {doc.type.toUpperCase()}
                    </div>
                    <div>
                       <h3 className="font-medium text-lg text-gray-900 truncate max-w-[200px]">{doc.title}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${doc.processingStatus?.status === 'completed' ? 'bg-black' : 'bg-gray-300 animate-pulse'}`}></div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                             {doc.processingStatus?.status === 'completed' ? 'Processed' : 'Syncing'}
                          </span>
                       </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/app/knowledge-base/${doc._id}`)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-black transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                   <div className="p-4 bg-gray-50/80 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uploaded</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(doc.createdAt || doc.updatedAt).toLocaleDateString()}</p>
                   </div>
                   <div className="p-4 bg-gray-50/80 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Size</p>
                      <p className="text-sm font-medium text-gray-700">
                        {doc.extractedContent?.wordCount ? `${(doc.extractedContent.wordCount / 1000).toFixed(1)}k words` : 'Calculating'}
                      </p>
                   </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-end justify-between relative z-10">
                   {/* Processing Dots */}
                   <div className="flex gap-1.5 pb-2">
                      {[1,2,3].map(i => (
                         <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
                      ))}
                   </div>

                   <div className="flex gap-2">
                      <button 
                        onClick={() => {
                            if (doc.processingStatus?.status !== 'completed') {
                              setToast({ 
                                isOpen: true, 
                                message: 'Document is still processing. Chunks will be available once processing is complete.', 
                                type: 'info' 
                              });
                              return;
                            }
                            setSelectedDocumentForChunks(doc._id);
                            setShowChunkModal(true);
                        }}
                        disabled={doc.processingStatus?.status !== 'completed'}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          doc.processingStatus?.status === 'completed'
                            ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
                            : 'text-gray-200 cursor-not-allowed'
                        }`}
                        title={doc.processingStatus?.status === 'completed' ? 'View Chunks' : 'Processing...'}
                      >
                         <Layers className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmDialog({ isOpen: true, documentId: doc._id })}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
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

      {/* Upload Modal - Workspace Style */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-blue-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">New Material</h2>
                  <p className="text-xs text-gray-500">Upload study documents</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* File Drop Zone - Workspace Card Style */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`rounded-[2rem] p-8 text-center transition-all cursor-pointer border-2 border-dashed ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
                    : selectedFile
                    ? 'border-green-400 bg-green-50/30'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50'
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
                  <div className="flex items-center gap-4 justify-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                       <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-base">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="ml-auto w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Upload className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold text-base">Drop file or click to browse</p>
                      <p className="text-gray-500 text-sm mt-1">PDF, PPTX, DOCX, Images (Max 50MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields - Refined */}
              <div className="space-y-5 mt-8">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Subject *</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none text-sm shadow-sm"
                    required
                  >
                      <option value="">Select subject</option>
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
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none text-sm shadow-sm"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none text-sm shadow-sm"
                    placeholder="e.g., Week 3 Lecture Notes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none resize-none text-sm shadow-sm"
                    rows={3}
                    placeholder="What's this material about?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none text-sm shadow-sm"
                    placeholder="lecture, exam, notes"
                  />
                </div>

                <div className="pt-2">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedSubject || !title.trim() || uploading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full font-bold text-base shadow-lg shadow-indigo-300/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
                              </div>
                            </div>
                          )}

      {/* Chunk Visualization Modal */}
      {showChunkModal && selectedDocumentForChunks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Document Chunks</h2>
                  <p className="text-sm text-gray-500">View how this document was split for RAG processing</p>
                            </div>
                        </div>
                            <button
                onClick={() => {
                  setShowChunkModal(false);
                  setSelectedDocumentForChunks(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ChunkVisualization documentId={selectedDocumentForChunks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseUpload;
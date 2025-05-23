# Document Storage System 

## Overview
A comprehensive per-user document storage system built on Supabase Storage with folder organization, multi-file type support, and real-time UI integration.

## Features

### 1. Per-User Storage Organization
- **User-specific folders**: Each user gets their own isolated storage space
- **Folder structure**: `users/{user_id}/documents/{folder_name}/`
- **Automatic folder creation**: System creates user folder on first upload
- **Custom folder support**: Users can create, rename, and organize folders

### 2. Multi-File Type Support
- **Medical Documents**: PDFs, DOC/DOCX files for reports, prescriptions, lab results
- **Medical Images**: JPG, PNG, HEIC for X-rays, photos, scans
- **Insurance Documents**: Policy documents, cards, claims
- **General Health Files**: Any relevant medical documentation

### 3. Metadata & Organization
- **Document Categories**: Lab reports, prescriptions, imaging, insurance, general
- **Automatic metadata extraction**: File size, type, upload date
- **User-defined metadata**: Custom tags, notes, provider information
- **Smart categorization**: AI-powered category suggestions based on content

### 4. Security & Privacy
- **Row-Level Security (RLS)**: Users can only access their own documents
- **Secure file URLs**: Signed URLs with expiration for downloads
- **HIPAA-ready architecture**: Encrypted storage, audit trails
- **Access control**: Fine-grained permissions for sharing (future feature)

## Technical Architecture

### Database Schema

#### `user_documents` table
```sql
CREATE TABLE user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  display_name TEXT NOT NULL, -- User-friendly name
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  category TEXT NOT NULL DEFAULT 'general', -- lab, prescription, imaging, insurance, general
  folder_path TEXT DEFAULT '/', -- Virtual folder structure
  tags TEXT[], -- Array of user-defined tags
  notes TEXT, -- User notes
  provider TEXT, -- Doctor/facility name
  date_taken TIMESTAMPTZ, -- When document was created (e.g., lab test date)
  metadata JSONB, -- Additional metadata (extracted data, AI analysis)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_category ON user_documents(category);
CREATE INDEX idx_user_documents_folder ON user_documents(folder_path);
CREATE INDEX idx_user_documents_tags ON user_documents USING GIN(tags);
```

#### `user_folders` table
```sql
CREATE TABLE user_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  folder_path TEXT NOT NULL, -- Full path like '/medical/2025/'
  parent_folder_id UUID REFERENCES user_folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3b82f6', -- Folder color for UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, folder_path)
);

CREATE INDEX idx_user_folders_user_id ON user_folders(user_id);
CREATE INDEX idx_user_folders_parent ON user_folders(parent_folder_id);
```

### RLS Policies
```sql
-- user_documents policies
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents" ON user_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON user_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON user_documents
  FOR DELETE USING (auth.uid() = user_id);

-- user_folders policies
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own folders" ON user_folders
  FOR ALL USING (auth.uid() = user_id);
```

### Supabase Storage Configuration

#### Bucket Setup
- **Primary bucket**: `user-documents`
- **Folder structure**: `users/{user_id}/documents/...`
- **File naming**: `{timestamp}-{sanitized-filename}`
- **Size limits**: 50MB per file, 5GB per user (configurable)

#### Storage Policies
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own files
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## API Endpoints

### File Upload API (`/api/documents/upload`)
- **Method**: POST
- **Body**: FormData with file(s) and metadata
- **Features**: 
  - Multiple file upload support
  - Progress tracking
  - Automatic virus scanning (future)
  - AI-powered categorization for medical documents

### Document Management API (`/api/documents`)
- **GET**: List user documents with filtering/search
- **PUT**: Update document metadata
- **DELETE**: Remove document and file

### Folder Management API (`/api/documents/folders`)
- **GET**: List user folders
- **POST**: Create new folder
- **PUT**: Rename/move folder
- **DELETE**: Delete folder (with confirmation)

### File Download API (`/api/documents/[id]/download`)
- **Method**: GET
- **Features**: Signed URLs, access logging, virus scanning

## UI Components

### Document Manager Dashboard
- **Grid/List view toggle**: Existing functionality enhanced
- **Drag & drop upload**: Multiple files, folder upload
- **Folder navigation**: Breadcrumbs, folder tree
- **Advanced filtering**: By type, date, category, tags
- **Bulk operations**: Select multiple, bulk delete/move

### Upload Interface
- **Drag & drop zone**: Visual feedback, file type validation
- **Progress indicators**: Individual file progress, overall progress
- **Metadata form**: Category, tags, notes, provider
- **Smart suggestions**: AI-powered category/tag suggestions

### File Viewer/Editor
- **PDF viewer**: In-browser PDF viewing
- **Image viewer**: Lightbox with zoom, rotation
- **Metadata editor**: Edit tags, notes, category
- **Share options**: Generate secure links (future)

## Integration with Existing Features

### Lab Report Processing
- **Enhanced upload flow**: Integrate with existing PDF extraction
- **Automatic categorization**: Lab reports auto-tagged and filed
- **AI analysis storage**: Save extracted data as document metadata

### Document Categories Mapping
- **Medical Reports**: From `app/(protected)/documents/page.tsx` categories
- **Lab Results**: Integration with existing lab report system
- **Imaging**: X-rays, scans, photos
- **Prescriptions**: Medication-related documents
- **Insurance**: Cards, policies, claims

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. Create database tables and RLS policies
2. Set up Supabase storage bucket and policies
3. Implement basic upload API endpoint
4. Create file management utilities

### Phase 2: API Development (Week 1-2)
1. Document CRUD operations
2. Folder management system
3. File download with signed URLs
4. Search and filtering capabilities

### Phase 3: UI Implementation (Week 2-3)
1. Enhanced documents page with real data
2. Upload interface with drag & drop
3. Folder navigation system
4. File viewer/preview components

### Phase 4: Advanced Features (Week 3-4)
1. AI-powered categorization
2. Integration with existing lab report processing
3. Advanced search with full-text capabilities
4. Mobile-responsive optimizations

### Phase 5: Security & Performance (Week 4)
1. Comprehensive security audit
2. Performance optimization
3. Error handling and validation
4. User acceptance testing

## Security Considerations

1. **File Type Validation**: Whitelist allowed file types
2. **Size Limits**: Prevent abuse with reasonable limits
3. **Virus Scanning**: Integration with security services
4. **Access Logging**: Track file access for compliance
5. **Data Encryption**: All files encrypted at rest
6. **Secure Deletion**: Proper file cleanup on deletion

## Performance Optimizations

1. **CDN Integration**: Supabase Edge for global distribution
2. **Image Optimization**: Automatic resizing and compression
3. **Lazy Loading**: Virtual scrolling for large document lists
4. **Caching Strategy**: Metadata caching, signed URL caching
5. **Background Processing**: Async operations for uploads

## Future Enhancements

1. **Document Sharing**: Secure sharing with healthcare providers
2. **OCR Integration**: Text extraction from images
3. **Document Templates**: Pre-defined forms and templates
4. **Calendar Integration**: Link documents to appointments
5. **Mobile App**: React Native app for document capture
6. **AI Assistant**: Natural language document queries

## Migration Strategy

1. **Existing Data**: Migrate any existing uploads to new structure
2. **Backward Compatibility**: Maintain existing lab report functionality
3. **User Communication**: Clear messaging about new features
4. **Gradual Rollout**: Feature flags for controlled deployment 
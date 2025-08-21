import React, { useState } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Grid3X3,
  List,
  Calendar,
  FileImage,
  Play,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MediaType } from '../../types';
import { formatDate } from '../../lib/utils';

// Mock media data
const mockMedia = [
  {
    id: '1',
    listingId: '1',
    listingTitle: '2 Bedroom Apartment near MMUST Gate B',
    url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    type: MediaType.IMAGE,
    alt: 'Living room with modern furniture',
    order: 1,
    isPrimary: true,
    width: 1920,
    height: 1080,
    fileSize: 245760,
    hash: 'abc123def456',
    processedAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:25:00Z'
  },
  {
    id: '2',
    listingId: '1',
    listingTitle: '2 Bedroom Apartment near MMUST Gate B',
    url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
    type: MediaType.IMAGE,
    alt: 'Bedroom with double bed',
    order: 2,
    isPrimary: false,
    width: 1920,
    height: 1080,
    fileSize: 198432,
    hash: 'def456ghi789',
    processedAt: '2024-01-15T10:32:00Z',
    createdAt: '2024-01-15T10:27:00Z'
  },
  {
    id: '3',
    listingId: '2',
    listingTitle: 'Single Room with WiFi - Kefinco Estate',
    url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
    type: MediaType.IMAGE,
    alt: 'Compact single room layout',
    order: 1,
    isPrimary: true,
    width: 1920,
    height: 1080,
    fileSize: 167890,
    hash: 'ghi789jkl012',
    processedAt: '2024-01-14T16:22:00Z',
    createdAt: '2024-01-14T16:18:00Z'
  },
  {
    id: '4',
    listingId: '3',
    listingTitle: 'Bedsitter near Matatu Stage',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    type: MediaType.VIDEO,
    alt: 'Video tour of bedsitter',
    order: 1,
    isPrimary: false,
    width: 1280,
    height: 720,
    fileSize: 1048576,
    hash: 'jkl012mno345',
    processedAt: '2024-01-13T14:45:00Z',
    createdAt: '2024-01-13T14:30:00Z'
  }
];

const MediaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return <FileImage className="h-4 w-4" />;
      case MediaType.VIDEO:
        return <Play className="h-4 w-4" />;
      case MediaType.VIRTUAL_TOUR:
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <FileImage className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: MediaType) => {
    const variants = {
      [MediaType.IMAGE]: 'default',
      [MediaType.VIDEO]: 'secondary',
      [MediaType.VIRTUAL_TOUR]: 'outline'
    } as const;

    return (
      <Badge variant={variants[type]}>
        {getTypeIcon(type)}
        <span className="ml-1">{type.toUpperCase()}</span>
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMedia = mockMedia.filter(media => {
    const matchesSearch = media.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         media.listingTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || media.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Media Library</h1>
          <p className="text-gray-400">Manage photos, videos, and virtual tours</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Image className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Images</p>
                <p className="text-2xl font-bold text-white">
                  {mockMedia.filter(m => m.type === MediaType.IMAGE).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Videos</p>
                <p className="text-2xl font-bold text-white">
                  {mockMedia.filter(m => m.type === MediaType.VIDEO).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ExternalLink className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Virtual Tours</p>
                <p className="text-2xl font-bold text-white">
                  {mockMedia.filter(m => m.type === MediaType.VIRTUAL_TOUR).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-white">
                  {formatFileSize(mockMedia.reduce((acc, m) => acc + (m.fileSize || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Media Files</CardTitle>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="virtual_tour">Virtual Tours</option>
              </select>
              <div className="flex border rounded-md border-[hsl(220,10%,20%)]">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((media) => (
                <div key={media.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="aspect-video bg-gray-800 relative">
                    {media.type === MediaType.IMAGE ? (
                      <img
                        src={media.url}
                        alt={media.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {media.isPrimary && (
                      <Badge className="absolute top-2 left-2" variant="success">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      {getTypeBadge(media.type)}
                      <span className="text-xs text-gray-400">#{media.order}</span>
                    </div>
                    <h3 className="font-medium text-white text-sm mb-1 truncate">{media.alt}</h3>
                    <p className="text-xs text-gray-400 mb-2 truncate">{media.listingTitle}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{media.width}×{media.height}</span>
                      <span>{formatFileSize(media.fileSize || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">{formatDate(media.createdAt)}</span>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedMedia(media);
                            setShowMediaModal(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMedia.map((media) => (
                <div key={media.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                        {media.type === MediaType.IMAGE ? (
                          <img
                            src={media.url}
                            alt={media.alt}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Play className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-white">{media.alt}</h3>
                          {getTypeBadge(media.type)}
                          {media.isPrimary && <Badge variant="success">Primary</Badge>}
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{media.listingTitle}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{media.width}×{media.height}</span>
                          <span>{formatFileSize(media.fileSize || 0)}</span>
                          <span>Order: {media.order}</span>
                          <span>{formatDate(media.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMedia(media);
                          setShowMediaModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Media"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-400">
            Upload images, videos, or virtual tour links for your listings.
          </p>
          
          <div className="border-2 border-dashed border-[hsl(220,10%,20%)] rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-gray-400">Supports JPG, PNG, MP4, and MOV files up to 10MB</p>
            <Button className="mt-4">
              Choose Files
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Associated Listing
              </label>
              <select className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                <option value="">Select a listing</option>
                <option value="1">2 Bedroom Apartment near MMUST Gate B</option>
                <option value="2">Single Room with WiFi - Kefinco Estate</option>
                <option value="3">Bedsitter near Matatu Stage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media Type
              </label>
              <select className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="virtual_tour">Virtual Tour</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alt Text / Description
            </label>
            <Input placeholder="Describe what this media shows..." />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-300">Set as primary image</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button>
              Upload Media
            </Button>
          </div>
        </div>
      </Modal>

      {/* Media Detail Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title="Media Details"
        size="xl"
      >
        {selectedMedia && (
          <div className="space-y-6">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {selectedMedia.type === MediaType.IMAGE ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Media Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{selectedMedia.type.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-white">{selectedMedia.width}×{selectedMedia.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Size:</span>
                    <span className="text-white">{formatFileSize(selectedMedia.fileSize || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order:</span>
                    <span className="text-white">#{selectedMedia.order}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Primary:</span>
                    <span className="text-white">{selectedMedia.isPrimary ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Listing Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Associated Listing:</span>
                    <p className="text-white mt-1">{selectedMedia.listingTitle}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Alt Text:</span>
                    <p className="text-white mt-1">{selectedMedia.alt}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Uploaded:</span>
                    <p className="text-white mt-1">{formatDate(selectedMedia.createdAt)}</p>
                  </div>
                  {selectedMedia.processedAt && (
                    <div>
                      <span className="text-gray-400">Processed:</span>
                      <p className="text-white mt-1">{formatDate(selectedMedia.processedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MediaPage;
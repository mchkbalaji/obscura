import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageEditor } from './components/ImageEditor';
import { Camera } from 'lucide-react';
import { loadModels } from './utils/faceDetection';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const loaded = await loadModels();
      setModelsLoaded(loaded);
      setLoading(false);
    };
    init();
  }, []);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading face detection models...</p>
        </div>
      </div>
    );
  }

  if (!modelsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Failed to load face detection models.</p>
          <p>Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800">Obscura</h1>
          </div>
          <p className="text-gray-600">
            Upload a photo, click on faces to blur them, and download the result
          </p>
        </div>

        {!image ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setImage(null)}
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              ← Upload a different image
            </button>
            <ImageEditor image={image} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
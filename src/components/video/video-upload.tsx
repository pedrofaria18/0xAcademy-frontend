'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { videoAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, XCircle, Film, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoUploadProps {
  courseId: string;
  lessonId?: string;
  onUploadComplete?: (videoId: string) => void;
  onUploadStart?: () => void;
  manualUpload?: boolean; // Se true, não mostra botão de upload - upload é controlado externamente
}

export interface VideoUploadRef {
  startUpload: () => Promise<{ videoId: string } | null>;
  hasFile: () => boolean;
  reset: () => void;
  setLessonId: (id: string) => void;
  getVideoDurationMinutes: () => number | null;
}

export const VideoUpload = forwardRef<VideoUploadRef, VideoUploadProps>(({
  courseId,
  lessonId: initialLessonId,
  onUploadComplete,
  onUploadStart,
  manualUpload = false
}, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [lessonId, setLessonIdState] = useState<string | undefined>(initialLessonId);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number | null>(null);

  console.log(status)

  // Formata duração em segundos para "MM:SS"
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        toast.error('Por favor, selecione um arquivo de vídeo');
        return;
      }

      // Validate file size (max 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (selectedFile.size > maxSize) {
        toast.error('Arquivo muito grande (máximo 2GB)');
        return;
      }

      setFile(selectedFile);
      setStatus('idle');
      setProgress(0);

      // Extract video duration
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        setVideoDurationSeconds(videoElement.duration);
      };

      videoElement.onerror = () => {
        window.URL.revokeObjectURL(videoElement.src);
        console.error('Error loading video metadata');
      };

      videoElement.src = URL.createObjectURL(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setStatus('uploading');
      setProgress(0);

      if (onUploadStart) {
        onUploadStart();
      }

      // Step 1: Get upload URL from backend
      const { uploadURL, videoId: newVideoId } = await videoAPI.getUploadUrl(
        courseId,
        lessonId
      );

      // Step 2: Upload file to Cloudflare Stream
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            // Limita a 95% durante o upload, 100% só quando receber a resposta
            const percent = Math.min((e.loaded / e.total) * 95, 95);
            setProgress(percent);
          }
        });

        // Handle successful upload
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100); // Agora sim, 100% quando a resposta é recebida
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        // Handle upload errors
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed - Network error'));
        });

        // Handle upload timeout
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload failed - Timeout'));
        });

        // Configure request
        xhr.open('POST', uploadURL);

        // Set timeout to 10 minutes for large files
        xhr.timeout = 10 * 60 * 1000;

        // Create FormData and append file
        // Cloudflare Stream expects the file as 'file' field in multipart/form-data
        const formData = new FormData();
        formData.append('file', file);

        // Send FormData (browser automatically sets Content-Type with boundary)
        xhr.send(formData);
      });

      // Step 3: Upload complete, now processing
      setStatus('processing');
      toast.success('Upload completo! O vídeo está sendo processado...');

      // Step 4: Poll for video status (optional)
      // The webhook will update the lesson when ready, but we can poll to show immediate feedback
      if (onUploadComplete && newVideoId) {
        onUploadComplete(newVideoId);
      }

      setStatus('success');

    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      toast.error('Falha no upload. Por favor, tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setVideoDurationSeconds(null);
  };

  // Expor métodos para controle externo
  useImperativeHandle(ref, () => ({
    startUpload: async () => {
      if (!file) {
        toast.error('Selecione um arquivo de vídeo primeiro');
        return null;
      }

      try {
        setUploading(true);
        setStatus('uploading');
        setProgress(0);

        if (onUploadStart) {
          onUploadStart();
        }

        // Step 1: Get upload URL from backend
        console.log('Uploading video with lessonId:', lessonId);
        const { uploadURL, videoId: newVideoId } = await videoAPI.getUploadUrl(
          courseId,
          lessonId
        );

        console.log('Got upload URL for video:', newVideoId);

        // Step 2: Upload file to Cloudflare Stream
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              // Limita a 95% durante o upload, 100% só quando receber a resposta
              const percent = Math.min((e.loaded / e.total) * 95, 95);
              setProgress(percent);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setProgress(100); // Agora sim, 100% quando a resposta é recebida
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed - Network error'));
          });

          xhr.addEventListener('timeout', () => {
            reject(new Error('Upload failed - Timeout'));
          });

          xhr.open('POST', uploadURL);
          xhr.timeout = 10 * 60 * 1000;

          const formData = new FormData();
          formData.append('file', file);
          xhr.send(formData);
        });

        setStatus('processing');

        if (onUploadComplete && newVideoId) {
          onUploadComplete(newVideoId);
        }

        setStatus('success');
        return { videoId: newVideoId };

      } catch (error) {
        console.error('Upload error:', error);
        setStatus('error');
        toast.error('Falha no upload. Por favor, tente novamente.');
        return null;
      } finally {
        setUploading(false);
      }
    },
    hasFile: () => !!file,
    reset: handleReset,
    setLessonId: (id: string) => setLessonIdState(id),
    getVideoDurationMinutes: () => videoDurationSeconds ? videoDurationSeconds / 60 : null
  }));

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        {!file ? (
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Clique para selecionar um vídeo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, MOV, AVI até 2GB
                </p>
              </div>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-start justify-between gap-4 text-left">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                  {status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {status === 'error' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {(status === 'idle' || status === 'uploading' || status === 'processing') && (
                    <Film className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {videoDurationSeconds && ` • ${formatDuration(videoDurationSeconds)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {status === 'uploading' && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Enviando... {Math.round(progress)}%
                </p>
              </div>
            )}

            {/* Processing Status */}
            {status === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando vídeo...</span>
              </div>
            )}

            {/* Action Buttons */}
            {!manualUpload && (
              <div className="flex gap-2 justify-center">
                {status === 'idle' && (
                  <>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 max-w-xs"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Fazer Upload
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                    >
                      Cancelar
                    </Button>
                  </>
                )}

                {(status === 'success' || status === 'error') && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                  >
                    Fazer Novo Upload
                  </Button>
                )}
              </div>
            )}

            {manualUpload && status === 'idle' && file && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  size="sm"
                >
                  Trocar arquivo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900 dark:text-green-100">
              <p className="font-medium mb-1">Upload concluído!</p>
              <p className="text-green-700 dark:text-green-300">
                Seu vídeo está sendo processado. Isso pode levar alguns minutos
                dependendo do tamanho do arquivo. Você pode continuar editando e
                o vídeo aparecerá automaticamente quando estiver pronto.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900 dark:text-red-100">
              <p className="font-medium mb-1">Erro no upload</p>
              <p className="text-red-700 dark:text-red-300">
                Não foi possível fazer o upload do vídeo. Por favor, verifique
                sua conexão e tente novamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Processando vídeo</p>
              <p className="text-blue-700 dark:text-blue-300">
                Seu vídeo foi enviado e está sendo processado pelo Cloudflare Stream.
                Geralmente leva de 1 a 5 minutos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

VideoUpload.displayName = 'VideoUpload';

/**
 * Attachment Options
 *
 * Opções de anexo de arquivos e mídia
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Paperclip,
  Image,
  FileText,
  Video,
  Music,
  File,
} from 'lucide-react';

interface AttachmentOptionsProps {
  onSelectFile?: (file: File) => void;
  disabled?: boolean;
}

export function AttachmentOptions({
  onSelectFile,
  disabled,
}: AttachmentOptionsProps) {
  const [open, setOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (file && onSelectFile) {
      onSelectFile(file);
      // TODO: Implementar upload e envio quando backend estiver pronto
      console.log(`Arquivo selecionado (${type}):`, file.name);
    }
    setOpen(false);
  };

  const attachmentTypes = [
    {
      name: 'Imagem',
      icon: Image,
      accept: 'image/*',
      inputRef: imageInputRef,
      color: 'text-blue-500',
    },
    {
      name: 'Documento',
      icon: FileText,
      accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
      inputRef: documentInputRef,
      color: 'text-orange-500',
    },
    {
      name: 'Vídeo',
      icon: Video,
      accept: 'video/*',
      inputRef: videoInputRef,
      color: 'text-purple-500',
    },
    {
      name: 'Áudio',
      icon: Music,
      accept: 'audio/*',
      inputRef: audioInputRef,
      color: 'text-green-500',
    },
    {
      name: 'Arquivo',
      icon: File,
      accept: '*',
      inputRef: fileInputRef,
      color: 'text-gray-500',
    },
  ];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
            Anexar
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {attachmentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.name}
                  onClick={() => type.inputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors text-left"
                >
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <span className="font-medium text-sm">{type.name}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden file inputs */}
      {attachmentTypes.map((type) => (
        <input
          key={type.name}
          ref={type.inputRef}
          type="file"
          accept={type.accept}
          onChange={(e) => handleFileSelect(e, type.name)}
          className="hidden"
        />
      ))}
    </>
  );
}

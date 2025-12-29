import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Sex } from '../lib/database.types';
import { useNotificationContext } from '../App';
import { Avatar } from './Avatar';

interface StudentFormProps {
  student: any | null;
  groups: any[];
  onClose: () => void;
  context: 'ministerio' | 'recepcao';
}

export function StudentForm({ student, groups, onClose, context }: StudentFormProps) {
  const { showSuccess, showError } = useNotificationContext();
  const [formData, setFormData] = useState<any>({
    full_name: '',
    birth_date: null,
    sex: null,
    group_id: null,
    guardian_name: null,
    guardian_contact: null,
    contact_phone: null,
    contact_email: null,
    member_type: 'Membro',
    notes: null,
    photo_url: null,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        birth_date: student.birth_date,
        sex: student.sex,
        group_id: student.group_id,
        guardian_name: student.guardian_name,
        guardian_contact: student.guardian_contact,
        contact_phone: student.contact_phone,
        contact_email: student.contact_email,
        member_type: student.member_type || 'Membro',
        notes: student.notes,
        photo_url: student.photo_url,
      });
      setPhotoPreview(student.photo_url);
    }
  }, [student]);

  const resizeImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Erro', 'Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      showError('Erro', 'A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);

    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file);
      
      // Create unique filename
      const fileExt = 'jpg'; // Always save as jpg after compression
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `student-photos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, resizedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: publicUrl });
      setPhotoPreview(publicUrl);
      showSuccess('Foto carregada com sucesso!');

    } catch (error: any) {
      showError('Erro ao carregar foto', error.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo_url: null });
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (student) {
        const tableName = context === 'recepcao' ? 'reception_members' : 'students';
        
        let updateData: any = {
          full_name: formData.full_name,
          birth_date: formData.birth_date,
          sex: formData.sex,
          group_id: formData.group_id,
          notes: formData.notes,
          photo_url: formData.photo_url
        };
        
        if (context === 'recepcao') {
          updateData.contact_phone = formData.contact_phone;
          updateData.contact_email = formData.contact_email;
          updateData.member_type = formData.member_type;
        } else {
          updateData.guardian_name = formData.guardian_name;
          updateData.guardian_contact = formData.guardian_contact;
        }
        
        const { error } = await (supabase as any)
          .from(tableName)
          .update(updateData)
          .eq('id', student.id);

        if (error) throw error;
        const entityName = context === 'recepcao' ? 'Membro' : 'Aluno';
        showSuccess(`${entityName} atualizado com sucesso!`);
      } else {
        const tableName = context === 'recepcao' ? 'reception_members' : 'students';
        
        let insertData: any = {
          full_name: formData.full_name,
          birth_date: formData.birth_date,
          sex: formData.sex,
          group_id: formData.group_id,
          notes: formData.notes,
          photo_url: formData.photo_url
        };
        
        if (context === 'recepcao') {
          insertData.contact_phone = formData.contact_phone;
          insertData.contact_email = formData.contact_email;
          insertData.member_type = formData.member_type;
        } else {
          insertData.guardian_name = formData.guardian_name;
          insertData.guardian_contact = formData.guardian_contact;
        }
        
        const { error } = await (supabase as any)
          .from(tableName)
          .insert([insertData]);

        if (error) throw error;
        const entityName = context === 'recepcao' ? 'Membro' : 'Aluno';
        showSuccess(`${entityName} criado com sucesso!`);
      }

      onClose();
    } catch (error: any) {
      const entityName = context === 'recepcao' ? 'membro' : 'aluno';
      showError(
        student ? `Erro ao atualizar ${entityName}` : `Erro ao criar ${entityName}`,
        error.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 
              (context === 'recepcao' ? 'Editar Membro' : 'Editar Aluno') : 
              (context === 'recepcao' ? 'Novo Membro' : 'Novo Aluno')
            }
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={context === 'recepcao' ? "Ex: Maria Silva Santos" : "Ex: João Silva Santos"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto {context === 'recepcao' ? 'do Membro' : 'do Aluno'}
            </label>
            <div className="flex items-center gap-4">
              <Avatar 
                src={photoPreview || formData.photo_url} 
                name={formData.full_name || (context === 'recepcao' ? 'Membro' : 'Aluno')} 
                size="xl"
              />
              <div className="flex-1">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="space-y-2">
                  <label
                    htmlFor="photo-upload"
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 
                      border border-gray-300 rounded-lg cursor-pointer
                      hover:bg-gray-50 transition-colors text-sm
                      ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <Upload size={16} />
                    {uploading ? 'Carregando...' : 'Escolher Foto'}
                  </label>
                  {(photoPreview || formData.photo_url) && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="block px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Remover Foto
                    </button>
                  )}
                  <p className="text-xs text-gray-500">
                    Máximo 5MB. A imagem será redimensionada automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo
              </label>
              <select
                value={formData.sex || ''}
                onChange={(e) => setFormData({ ...formData, sex: (e.target.value as Sex) || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo
            </label>
            <select
              value={formData.group_id || ''}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Campos específicos para cada contexto */}
          {context === 'recepcao' ? (
            <>
              {/* Campo de Tipo de Membro para Recepção */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Membro
                </label>
                <select
                  value={formData.member_type || 'Membro'}
                  onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Membro">Membro</option>
                  <option value="Visitante">Visitante</option>
                </select>
              </div>

              {/* Campos de contato para Recepção */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value || null })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value || null })}
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Campos para Ministério Infantil */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.guardian_name || ''}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value || null })}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contato do Responsável
                  </label>
                  <input
                    type="tel"
                    value={formData.guardian_contact || ''}
                    onChange={(e) => setFormData({ ...formData, guardian_contact: e.target.value || null })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              placeholder="Informações adicionais sobre o aluno..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : (student ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { CreateTemplateData, useCreateTemplate } from '@/hooks';

export const useCreateTemp = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<any>(null);
    const [formData, setFormData] = useState<CreateTemplateData>({
      title: '',
      description: '',
      type: 'public',
      category: '',
      specialityId: '',
      prompt: ''
    });

    const createMutation = useCreateTemplate();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    
        const templateData = {
          ...formData,
          category: category || null,
        };
    
        createMutation.mutate(templateData, {
          onSuccess: () => {
            setIsOpen(false);
            setFormData({ title: '', description: '', category: '', specialityId:'', prompt: '' });
            setCategory(null);
            if (onSuccess) onSuccess();
          }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    return {
        handleChange,
        handleSubmit,
        isOpen,
        setIsOpen,
        category,
        setCategory,
        formData,
        setFormData,
        createMutation
    }
}
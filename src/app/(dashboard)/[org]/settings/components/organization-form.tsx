/**
 * Organization Form
 *
 * Form para editar dados básicos da organização
 */

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Organization } from '@/lib/db/repositories/organization';
import { createClient } from '@/lib/db/supabase/client';
import type { Database } from '@/types/database';

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  timezone: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface OrganizationFormProps {
  organization: Organization;
}

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
];

export function OrganizationForm({ organization }: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
      timezone: organization.timezone || 'America/Sao_Paulo', 
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const updateData: Database['public']['Tables']['organizations']['Update'] = {
        name: values.name,
        timezone: values.timezone,
      };

      const { error } = await supabase
        .from('organizations')
        // @ts-expect-error - Supabase generated types issue with strict mode
        .update(updateData)
        .eq('id', organization.id);

      if (error) {
        throw error;
      }

      toast.success('Dados da organização atualizados com sucesso');

      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Não foi possível atualizar os dados');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Organização</FormLabel>
              <FormControl>
                <Input placeholder="Minha Empresa" {...field} />
              </FormControl>
              <FormDescription>
                Nome que será exibido no dashboard e para seus clientes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fuso Horário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Usado para calcular horários de atendimento e relatórios
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </Form>
  );
}

/**
 * Default Messages Form
 *
 * Form para editar mensagens padrão (boas-vindas, fora do horário)
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Organization } from '@/lib/db/repositories/organization';
import { createClient } from '@/lib/db/supabase/client';
import type { Database } from '@/types/database';

const formSchema = z.object({
  welcome_message: z.string().max(500, 'Máximo 500 caracteres').nullable(),
  out_of_hours_message: z.string().max(500, 'Máximo 500 caracteres').nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface DefaultMessagesFormProps {
  organization: Organization;
}

export function DefaultMessagesForm({ organization }: DefaultMessagesFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      welcome_message: organization.welcome_message || '',
      out_of_hours_message: organization.out_of_hours_message || '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const updateData: Database['public']['Tables']['organizations']['Update'] = {
        welcome_message: values.welcome_message,
        out_of_hours_message: values.out_of_hours_message,
      };

      const { error } = await supabase
        .from('organizations')
        // @ts-expect-error - Supabase generated types issue with strict mode
        .update(updateData)
        .eq('id', organization.id);

      if (error) {
        throw error;
      }

      toast.success('Mensagens padrão atualizadas com sucesso');
    } catch (error) {
      console.error('Error updating default messages:', error);
      toast.error('Não foi possível atualizar as mensagens');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="welcome_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem de Boas-vindas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Olá! Bem-vindo à nossa empresa. Como posso ajudar?"
                  className="resize-none"
                  rows={4}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Enviada automaticamente quando um cliente entra em contato pela primeira vez
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="out_of_hours_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem Fora do Horário</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Estamos fora do horário de atendimento. Retornaremos em breve!"
                  className="resize-none"
                  rows={4}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Enviada quando um cliente entra em contato fora do horário de atendimento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar mensagens'}
        </Button>
      </form>
    </Form>
  );
}

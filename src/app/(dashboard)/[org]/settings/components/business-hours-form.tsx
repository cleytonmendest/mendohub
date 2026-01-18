/**
 * Business Hours Form
 *
 * Form para editar horários de atendimento por dia da semana
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
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Organization } from '@/lib/db/repositories/organization';
import { createClient } from '@/lib/db/supabase/client';
import type { Database } from '@/types/database';

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  start: z.string().nullable(),
  end: z.string().nullable(),
});

const formSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

type FormValues = z.infer<typeof formSchema>;
type DaySchedule = z.infer<typeof dayScheduleSchema>;

interface BusinessHoursFormProps {
  organization: Organization;
}

const DAYS = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

const DEFAULT_SCHEDULE: DaySchedule = {
  enabled: true,
  start: '09:00',
  end: '18:00',
};

const DISABLED_SCHEDULE: DaySchedule = {
  enabled: false,
  start: null,
  end: null,
};

export function BusinessHoursForm({ organization }: BusinessHoursFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Parse business_hours from JSONB or use defaults
  const businessHours = organization.business_hours as FormValues | null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monday: businessHours?.monday || DEFAULT_SCHEDULE,
      tuesday: businessHours?.tuesday || DEFAULT_SCHEDULE,
      wednesday: businessHours?.wednesday || DEFAULT_SCHEDULE,
      thursday: businessHours?.thursday || DEFAULT_SCHEDULE,
      friday: businessHours?.friday || DEFAULT_SCHEDULE,
      saturday: businessHours?.saturday || DISABLED_SCHEDULE,
      sunday: businessHours?.sunday || DISABLED_SCHEDULE,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const updateData: Database['public']['Tables']['organizations']['Update'] = {
        business_hours: values,
      };

      const { error } = await supabase
        .from('organizations')
        // @ts-expect-error - Supabase generated types issue with strict mode
        .update(updateData)
        .eq('id', organization.id);

      if (error) {
        throw error;
      }

      toast.success('Horários de atendimento atualizados com sucesso');
    } catch (error) {
      console.error('Error updating business hours:', error);
      toast.error('Não foi possível atualizar os horários');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {DAYS.map((day) => {
          const dayKey = day.key as keyof FormValues;
          const isEnabled = form.watch(`${dayKey}.enabled`);

          return (
            <div
              key={day.key}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              {/* Checkbox enabled */}
              <FormField
                control={form.control}
                name={`${dayKey}.enabled`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Se desabilitar, limpar horários
                          if (!checked) {
                            form.setValue(`${dayKey}.start`, null);
                            form.setValue(`${dayKey}.end`, null);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Dia da semana */}
              <span className="min-w-[120px] text-sm font-medium">
                {day.label}
              </span>

              {/* Horários */}
              <div className="flex flex-1 items-center gap-2">
                <FormField
                  control={form.control}
                  name={`${dayKey}.start`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="time"
                          disabled={!isEnabled}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <span className="text-sm text-muted-foreground">até</span>

                <FormField
                  control={form.control}
                  name={`${dayKey}.end`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="time"
                          disabled={!isEnabled}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          );
        })}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar horários'}
        </Button>
      </form>
    </Form>
  );
}

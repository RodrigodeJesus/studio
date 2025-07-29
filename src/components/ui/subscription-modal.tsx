"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, X } from 'lucide-react';

type SubscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
};

export default function SubscriptionModal({ open, onClose, onSubscribe }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Mensal',
      price: 'R$ 1,99',
      period: '/mês',
      description: 'Acesso completo por 1 mês',
      savings: null,
    },
    {
      id: 'yearly' as const,
      name: 'Anual',
      price: 'R$ 19,99',
      period: '/ano',
      description: 'Acesso completo por 1 ano',
      savings: 'Economize 17%',
    },
  ];

  const benefits = [
    'Sem anúncios',
    'Acesso a todos os níveis',
    'Estatísticas detalhadas',
    'Temas exclusivos',
    'Suporte prioritário',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="text-primary" size={24} />
              <DialogTitle className="text-xl">Caça Time Premium</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
          <DialogDescription>
            Desfrute da experiência completa sem anúncios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefícios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="text-primary" size={20} />
                Benefícios Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Planos */}
          <div className="space-y-3">
            <h3 className="font-semibold">Escolha seu plano:</h3>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{plan.name}</h4>
                        {plan.savings && (
                          <Badge variant="secondary" className="text-xs">
                            {plan.savings}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{plan.price}</div>
                      <div className="text-sm text-muted-foreground">{plan.period}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={() => onSubscribe(selectedPlan)}
              className="w-full"
              size="lg"
            >
              <Crown className="mr-2" size={16} />
              Assinar {plans.find(p => p.id === selectedPlan)?.name}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Continuar com anúncios
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Cancele a qualquer momento. Renovação automática.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
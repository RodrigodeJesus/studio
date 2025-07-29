"use client";

import { useState, useEffect } from 'react';

type SubscriptionStatus = 'free' | 'premium';
type SubscriptionPlan = 'monthly' | 'yearly' | null;

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [plan, setPlan] = useState<SubscriptionPlan>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento do status da assinatura
    const loadSubscriptionStatus = () => {
      try {
        const savedStatus = localStorage.getItem('subscription_status') as SubscriptionStatus;
        const savedPlan = localStorage.getItem('subscription_plan') as SubscriptionPlan;
        
        if (savedStatus) {
          setStatus(savedStatus);
        }
        if (savedPlan) {
          setPlan(savedPlan);
        }
      } catch (error) {
        console.error('Erro ao carregar status da assinatura:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionStatus();
  }, []);

  const subscribe = async (selectedPlan: 'monthly' | 'yearly') => {
    try {
      setLoading(true);
      
      // Aqui seria a integração com o sistema de pagamento (Google Play Billing, etc.)
      // Por enquanto, simula uma assinatura bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('premium');
      setPlan(selectedPlan);
      
      localStorage.setItem('subscription_status', 'premium');
      localStorage.setItem('subscription_plan', selectedPlan);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      return { success: false, error: 'Erro ao processar pagamento' };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      
      // Aqui seria a integração com o sistema de cancelamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('free');
      setPlan(null);
      
      localStorage.setItem('subscription_status', 'free');
      localStorage.removeItem('subscription_plan');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return { success: false, error: 'Erro ao cancelar assinatura' };
    } finally {
      setLoading(false);
    }
  };

  const isPremium = status === 'premium';
  const isMonthly = plan === 'monthly';
  const isYearly = plan === 'yearly';

  return {
    status,
    plan,
    loading,
    isPremium,
    isMonthly,
    isYearly,
    subscribe,
    cancelSubscription,
  };
}
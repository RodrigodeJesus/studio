"use client";

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type MobileInterstitialAdProps = {
  open: boolean;
  onClose: () => void;
  adKey?: number;
};

export default function MobileInterstitialAd({ open, onClose, adKey = 0 }: MobileInterstitialAdProps) {
  useEffect(() => {
    if (open) {
      try {
        // Em produção, aqui seria a inicialização do AdMob Interstitial
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdMob Interstitial Error:", err);
      }
    }
  }, [open, adKey]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-sm w-full h-[80vh] flex flex-col p-0" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Anúncio</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-500 mx-4 rounded-md">
          <div className="text-center">
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', width: '300px', height: '250px' }}
              data-ad-client="ca-pub-3940256099942544"
              data-ad-slot="1033173712"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <p className="mt-4 text-sm">Anúncio Interstitial</p>
          </div>
        </div>
        
        <DialogFooter className="p-4 pt-2">
          <Button onClick={onClose} className="w-full">
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
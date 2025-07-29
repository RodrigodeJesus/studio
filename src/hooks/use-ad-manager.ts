"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from './use-subscription';

export function useAdManager() {
  const { isPremium } = useSubscription();
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [bannerKey, setBannerKey] = useState(0);

  // Carrega o contador de jogos do localStorage
  useEffect(() => {
    const savedGames = localStorage.getItem('games_played');
    if (savedGames) {
      setGamesPlayed(parseInt(savedGames, 10));
    }
  }, []);

  // Salva o contador no localStorage
  useEffect(() => {
    localStorage.setItem('games_played', gamesPlayed.toString());
  }, [gamesPlayed]);

  const onGameFinished = useCallback(() => {
    if (isPremium) return; // Não mostra anúncios para usuários premium

    const newGamesPlayed = gamesPlayed + 1;
    setGamesPlayed(newGamesPlayed);

    // Mostra anúncio intersticial a cada 3 jogos
    if (newGamesPlayed % 3 === 0) {
      setShowInterstitial(true);
    }

    // Atualiza banner ad
    setBannerKey(prev => prev + 1);
  }, [gamesPlayed, isPremium]);

  const closeInterstitial = useCallback(() => {
    setShowInterstitial(false);
  }, []);

  const refreshBanner = useCallback(() => {
    if (!isPremium) {
      setBannerKey(prev => prev + 1);
    }
  }, [isPremium]);

  const shouldShowBanner = !isPremium;
  const shouldShowInterstitial = !isPremium && showInterstitial;

  return {
    gamesPlayed,
    shouldShowBanner,
    shouldShowInterstitial,
    bannerKey,
    onGameFinished,
    closeInterstitial,
    refreshBanner,
  };
}
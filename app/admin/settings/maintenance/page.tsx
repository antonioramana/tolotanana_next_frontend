'use client';

import { useState, useEffect } from 'react';
import { MaintenanceApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FiTool, FiArrowLeft, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function MaintenanceSettingsPage() {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState('');
  const [activatedAt, setActivatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [savingMessage, setSavingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await MaintenanceApi.getStatus();
      setIsActive(data.isActive);
      setMessage(data.message);
      setActivatedAt(data.activatedAt);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger le statut', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const data = await MaintenanceApi.toggle(!isActive, message);
      setIsActive(data.isActive);
      setActivatedAt(data.activatedAt);
      toast({
        title: data.isActive ? 'Mode maintenance activé' : 'Mode maintenance désactivé',
        description: data.isActive
          ? 'La plateforme est maintenant en maintenance'
          : 'La plateforme est de nouveau accessible',
      });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de changer le statut', variant: 'destructive' });
    } finally {
      setToggling(false);
    }
  };

  const handleSaveMessage = async () => {
    if (!message.trim()) return;
    setSavingMessage(true);
    try {
      await MaintenanceApi.updateMessage(message);
      toast({ title: 'Message mis à jour', description: 'Le message de maintenance a été sauvegardé' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le message', variant: 'destructive' });
    } finally {
      setSavingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <FiArrowLeft className="w-4 h-4" />
          Retour aux paramètres
        </Link>
        <h1 className="text-3xl font-bold">Mode Maintenance</h1>
        <p className="text-muted-foreground mt-2">
          Activez le mode maintenance pour bloquer l&apos;accès à la plateforme
        </p>
      </div>

      {/* Status Card */}
      <Card className={`mb-6 border-2 ${isActive ? 'border-orange-400 bg-orange-50/50' : 'border-green-400 bg-green-50/50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isActive ? (
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">
                  {isActive ? 'Maintenance active' : 'Plateforme en ligne'}
                </CardTitle>
                <CardDescription>
                  {isActive && activatedAt
                    ? `Activée le ${new Date(activatedAt).toLocaleString('fr-FR')}`
                    : 'La plateforme fonctionne normalement'}
                </CardDescription>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
                isActive
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {toggling
                ? 'En cours...'
                : isActive
                  ? 'Désactiver'
                  : 'Activer la maintenance'}
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Message Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FiTool className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle>Message de maintenance</CardTitle>
              <CardDescription>
                Ce message sera affiché aux visiteurs pendant la maintenance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
            placeholder="Message affiché pendant la maintenance..."
          />
          <button
            onClick={handleSaveMessage}
            disabled={savingMessage || !message.trim()}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingMessage ? 'Sauvegarde...' : 'Sauvegarder le message'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

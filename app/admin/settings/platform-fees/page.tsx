'use client';

import { useState, useEffect } from 'react';
import { PlatformFeesApi } from '@/lib/api';
import { PlatformFees, CreatePlatformFeesDto, UpdatePlatformFeesDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiPercent, FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PlatformFeesPage() {
  const [fees, setFees] = useState<PlatformFees[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFees, setEditingFees] = useState<PlatformFees | null>(null);
  const [formData, setFormData] = useState<CreatePlatformFeesDto>({
    percentage: 5.0,
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await PlatformFeesApi.list();
      setFees(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les frais de plateforme',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (formData.percentage < 0 || formData.percentage > 100) {
        toast({
          title: 'Erreur',
          description: 'Le pourcentage doit être entre 0 et 100',
          variant: 'destructive',
        });
        return;
      }

      await PlatformFeesApi.create(formData);
      toast({
        title: 'Succès',
        description: 'Frais de plateforme créés avec succès',
      });
      setIsCreateModalOpen(false);
      setFormData({ percentage: 5.0, description: '' });
      loadFees();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async () => {
    if (!editingFees) return;

    try {
      if (formData.percentage < 0 || formData.percentage > 100) {
        toast({
          title: 'Erreur',
          description: 'Le pourcentage doit être entre 0 et 100',
          variant: 'destructive',
        });
        return;
      }

      await PlatformFeesApi.update(editingFees.id, formData);
      toast({
        title: 'Succès',
        description: 'Frais de plateforme mis à jour avec succès',
      });
      setIsEditModalOpen(false);
      setEditingFees(null);
      setFormData({ percentage: 5.0, description: '' });
      loadFees();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await PlatformFeesApi.setActive(id);
      toast({
        title: 'Succès',
        description: 'Frais de plateforme activés avec succès',
      });
      loadFees();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'activation',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await PlatformFeesApi.delete(id);
      toast({
        title: 'Succès',
        description: 'Frais de plateforme supprimés avec succès',
      });
      loadFees();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (feesItem: PlatformFees) => {
    setEditingFees(feesItem);
    setFormData({
      percentage: feesItem.percentage,
      description: feesItem.description || '',
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Frais de Plateforme</h1>
          <p className="text-gray-600 mt-2">
            Gérez les frais de plateforme appliqués aux donations
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="mr-2 h-4 w-4" />
              Nouveaux Frais
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer de Nouveaux Frais</DialogTitle>
              <DialogDescription>
                Définissez un nouveau pourcentage de frais de plateforme
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage" className="text-right">
                  Pourcentage
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                    className="pr-8"
                  />
                  <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Description optionnelle des frais..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {fees.map((feesItem) => (
          <Card key={feesItem.id} className={`${feesItem.isActive ? 'ring-2 ring-green-500' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FiPercent className="h-5 w-5" />
                    {feesItem.percentage}% de frais
                    {feesItem.isActive && (
                      <Badge variant="default" className="bg-green-500">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Actif
                      </Badge>
                    )}
                  </CardTitle>
                  {feesItem.description && (
                    <CardDescription className="mt-2">
                      {feesItem.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {!feesItem.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(feesItem.id)}
                    >
                      <FiCheck className="mr-1 h-4 w-4" />
                      Activer
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(feesItem)}
                  >
                    <FiEdit2 className="mr-1 h-4 w-4" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <FiTrash2 className="mr-1 h-4 w-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ces frais de plateforme ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(feesItem.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FiUser className="h-4 w-4" />
                  {feesItem.creator.firstName} {feesItem.creator.lastName}
                </div>
                <div className="flex items-center gap-1">
                  <FiCalendar className="h-4 w-4" />
                  {format(new Date(feesItem.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {fees.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FiPercent className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun frais configuré</h3>
              <p className="text-gray-600 text-center mb-4">
                Créez votre premier pourcentage de frais de plateforme
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <FiPlus className="mr-2 h-4 w-4" />
                Créer des Frais
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les Frais</DialogTitle>
            <DialogDescription>
              Modifiez le pourcentage et la description des frais
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-percentage" className="text-right">
                Pourcentage
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="edit-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  className="pr-8"
                />
                <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Description optionnelle des frais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEdit}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

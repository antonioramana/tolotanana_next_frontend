'use client';

import { useState, useEffect } from 'react';
import { ContactApi } from '@/lib/api';
import { ContactMessage, ContactStats } from '@/types';

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats>({ total: 0, unread: 0, replied: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filter]);

  // Fonction pour afficher les notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await ContactApi.getAll(1, 50, filter);
      setMessages(response.messages);
    } catch (error: any) {
      showNotification('error', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await ContactApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await ContactApi.markAsRead(id);
      showNotification('success', 'Message marqué comme lu');
      loadMessages();
      loadStats();
    } catch (error: any) {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await ContactApi.reply(selectedMessage.id, { reply: replyText });
      showNotification('success', 'Réponse envoyée avec succès');
      setIsReplyModalOpen(false);
      setReplyText('');
      setSelectedMessage(null);
      loadMessages();
      loadStats();
    } catch (error: any) {
      showNotification('error', 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.')) {
      try {
        await ContactApi.delete(id);
        showNotification('success', 'Message supprimé avec succès');
        loadMessages();
        loadStats();
      } catch (error: any) {
        showNotification('error', 'Erreur lors de la suppression');
      }
    }
  };

  const openReplyModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText('');
    setIsReplyModalOpen(true);
    
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #ea580c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          borderRadius: '6px',
          color: 'white',
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Messages de Contact
        </h1>
        <p style={{ color: '#6b7280' }}>
          Gérez les messages reçus via le formulaire de contact
        </p>
      </div>

      {/* Statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#dbeafe', 
              borderRadius: '8px', 
              marginRight: '1rem' 
            }}>
              📥
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {stats.total}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Total</p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee2e2', 
              borderRadius: '8px', 
              marginRight: '1rem' 
            }}>
              ✉️
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {stats.unread}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Non lus</p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#dcfce7', 
              borderRadius: '8px', 
              marginRight: '1rem' 
            }}>
              ✅
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {stats.replied}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Répondus</p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fed7aa', 
              borderRadius: '8px', 
              marginRight: '1rem' 
            }}>
              ⏳
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {stats.pending}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>En attente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <span style={{ color: '#374151', fontWeight: '500' }}>Filtrer par :</span>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'replied')}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '0.875rem'
          }}
        >
          <option value="all">Tous les messages</option>
          <option value="unread">Non lus</option>
          <option value="replied">Répondus</option>
        </select>
      </div>

      {/* Liste des messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            style={{ 
              border: !message.isRead ? '2px solid #bfdbfe' : '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              backgroundColor: !message.isRead ? '#eff6ff' : 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {message.subject}
                  </h3>
                  {!message.isRead && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Nouveau
                    </span>
                  )}
                  {message.isReplied && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      ✅ Répondu
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  flexWrap: 'wrap'
                }}>
                  <span>👤 {message.name}</span>
                  <span>✉️ {message.email}</span>
                  <span>📅 {formatDate(message.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!message.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(message.id)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    👁️ Marquer lu
                  </button>
                )}
                <button
                  onClick={() => openReplyModal(message)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  💬 {message.isReplied ? 'Voir réponse' : 'Répondre'}
                </button>
                <button
                  onClick={() => handleDelete(message.id)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #dc2626',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: '#f9fafb', 
              padding: '1rem', 
              borderRadius: '6px',
              marginBottom: message.isReplied && message.reply ? '1rem' : 0
            }}>
              <p style={{ color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>
                {message.message}
              </p>
            </div>

            {message.isReplied && message.reply && (
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                padding: '1rem', 
                borderRadius: '6px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <span style={{ fontWeight: '600', color: '#065f46' }}>Votre réponse</span>
                  {message.repliedAt && (
                    <span style={{ fontSize: '0.875rem', color: '#059669' }}>
                      • {formatDate(message.repliedAt)}
                    </span>
                  )}
                </div>
                <p style={{ color: '#065f46', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {message.reply}
                </p>
              </div>
            )}
          </div>
        ))}

        {messages.length === 0 && (
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              Aucun message
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {filter === 'unread' ? 'Aucun message non lu' : 
               filter === 'replied' ? 'Aucun message répondu' : 
               'Aucun message de contact reçu'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de réponse */}
      {isReplyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              {selectedMessage?.isReplied ? 'Réponse existante' : 'Répondre au message'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Message de {selectedMessage?.name} ({selectedMessage?.email})
            </p>

            {selectedMessage && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Message original :
                </label>
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '1rem', 
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.isReplied && selectedMessage.reply ? (
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Réponse actuelle :
                    </label>
                    <div style={{ 
                      backgroundColor: '#ecfdf5', 
                      padding: '1rem', 
                      borderRadius: '6px',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#065f46' }}>
                        {selectedMessage.reply}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="reply" style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Votre réponse :
                    </label>
                    <textarea
                      id="reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tapez votre réponse ici..."
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
              {selectedMessage && !selectedMessage.isReplied && (
                <button
                  onClick={handleReply}
                  disabled={isSubmitting || !replyText.trim()}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: isSubmitting || !replyText.trim() ? '#9ca3af' : '#ea580c',
                    color: 'white',
                    cursor: isSubmitting || !replyText.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Envoi...' : '💬 Envoyer la réponse'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
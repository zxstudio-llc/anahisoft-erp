import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoaderCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  planId: number
  billingPeriod: string
  email: string
  onPaymentSuccess: (transactionId: string) => void
  onPaymentError: (error: Error) => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  planId,
  billingPeriod,
  email,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const popupRef = useRef<Window | null>(null)
  const popupCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (popupCheckInterval.current) clearInterval(popupCheckInterval.current)
    }
  }, [])

  const handleClose = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
    setIsCompleted(false)
    setTransactionId(null)
    setIsLoading(false)
    onClose()
  }

  // Iniciar pago
  const handleStartPayment = async () => {
    setIsLoading(true)

    try {
      const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''

      console.log('📤 Enviando:', { planId, billingPeriod, amount, email })
      console.log('🔐 CSRF:', csrfToken ? '✓' : '✗')

      const response = await fetch('/payment/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_period: billingPeriod,
          amount,
          email,
        }),
      })

      const data = await response.json()

      console.log('📥 Respuesta:', response.status, data)

      if (!data.success) {
        const errorMsg = data.message || 'Error al crear el link de pago'
        console.error('❌', errorMsg)
        toast.error(errorMsg)
        setIsLoading(false)
        onPaymentError(new Error(errorMsg))
        return
      }

      const paymentUrl = data.payment_url
      const clientTxnId = data.client_transaction_id

      console.log('🔗 Link:', paymentUrl)

      // Abrir PayPhone en popup
      popupRef.current = window.open(
        paymentUrl,
        'PayPhonePayment',
        'width=900,height=700,top=50,left=50,resizable=yes,scrollbars=yes'
      )

      if (!popupRef.current) {
        toast.error('Por favor, habilita las ventanas emergentes')
        setIsLoading(false)
        return
      }

      console.log('✅ Popup abierto')

      // Monitorear cierre del popup
      popupCheckInterval.current = setInterval(() => {
        if (popupRef.current?.closed) {
          clearInterval(popupCheckInterval.current!)
          console.log('🔄 Popup cerrado, mostrando success')
          
          // Mostrar success (en producción verificarías en tu BD)
          setTransactionId(clientTxnId)
          setIsCompleted(true)
          setIsLoading(false)
          toast.success('¡Pago completado!')
          onPaymentSuccess(clientTxnId)
        }
      }, 1000)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el pago')
      setIsLoading(false)
      onPaymentError(error as Error)
    }
  }

  // Auto-iniciar cuando abre
  useEffect(() => {
    if (isOpen && !isCompleted) {
      handleStartPayment()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isCompleted ? '¡Pago exitoso!' : 'Procesando pago'}
          </DialogTitle>
          <DialogDescription>
            {isCompleted
              ? 'Tu transacción fue procesada correctamente. Gracias por tu compra.'
              : 'Se abrirá una ventana para completar tu pago.'}
          </DialogDescription>
        </DialogHeader>

        {!isCompleted ? (
          <div className="mt-4 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <span>
                {isLoading
                  ? 'Abriendo PayPhone...'
                  : 'Completando pago...'}
              </span>
            </div>

            {!isLoading && (
              <div className="text-center text-sm text-gray-600 space-y-2">
                <p>📍 Ventana de pago abierta</p>
                <p>✅ Completa el pago en la otra ventana</p>
                <p>⏳ Cuando termines, este modal se actualizará</p>
              </div>
            )}

            <button
              onClick={handleClose}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-lg font-semibold">Pago completado con éxito</p>
            {transactionId && (
              <p className="text-sm text-gray-500">
                ID: {transactionId}
              </p>
            )}
            <button
              onClick={handleClose}
              className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Cerrar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
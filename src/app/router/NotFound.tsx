import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '@/shared/ui/shadcn/button'

export function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-text-secondary">O endereço que você acessou não existe.</p>
      <Button asChild><Link to="/">Voltar ao início</Link></Button>
    </div>
  )
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-start gap-4 py-12" role="alert">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-text-secondary">{error instanceof Error ? error.message : 'Erro inesperado.'}</p>
      <Button variant="outline" onClick={reset}>Tentar novamente</Button>
    </div>
  )
}

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pt-40 pb-24 text-center px-6">
          <p className="font-display text-2xl uppercase tracking-widest">Something went wrong</p>
          <p className="mt-4 text-mist text-sm">Try reloading the page.</p>
          <a
            href="/"
            className="mt-8 inline-block border border-white/20 px-8 py-3 uppercase tracking-[0.3em] text-xs hover:border-paper transition-colors"
          >
            Back to home
          </a>
        </div>
      )
    }
    return this.props.children
  }
}

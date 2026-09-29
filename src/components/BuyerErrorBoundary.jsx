import React from 'react';
import { markUpdateBootFailed } from '../updates/liveUpdates';

class BuyerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    markUpdateBootFailed();
    console.error('Buyer workspace render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="buyer-error-boundary" role="alert">
          <h2>We couldn’t load the Buyer workspace</h2>
          <p>Please refresh the page. If the problem continues, contact Zinoo support.</p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>Refresh workspace</button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default BuyerErrorBoundary;

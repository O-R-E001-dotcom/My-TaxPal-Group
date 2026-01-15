

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chat Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          ⚠️ Failed to load this message.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
from app import create_app

# Create the Flask app instance
app = create_app()

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

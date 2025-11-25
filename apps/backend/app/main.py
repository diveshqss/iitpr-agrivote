from app import create_app

app = create_app()

if __name__ == "__main__":
    print("main app running")
    app.run(debug=True)
    print("main app ran")

# HTTP Server Project

This project implements an HTTP server that interacts with the OpenAI API to handle user prompts and generate responses. The server is built using Python and is structured to separate concerns between the server logic and the application logic.

## Project Structure

```
http-server-project
├── src
│   ├── localmain.py        # Main logic for handling user prompts and OpenAI API interaction
│   ├── server.py           # HTTP server implementation
│   ├── config.py           # Configuration settings (API key, max tokens)
│   └── utils
│       ├── __init__.py     # Initialization file for the utils package
│       └── tailoredUtils.py # Utility functions and tools
├── requirements.txt        # Project dependencies
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd http-server-project
   ```

2. **Create a virtual environment** (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

4. **Configure your API key**:
   - Open `src/config.py` and set your OpenAI API key.

## Usage

1. **Run the server**:
   ```
   python src/server.py
   ```

2. **Send a request**:
   - You can use tools like `curl` or Postman to send a POST request to the server with a JSON body containing the `user_prompt`.

   Example request:
   ```
   POST http://localhost:8000/ask
   Content-Type: application/json

   {
       "user_prompt": "Who are you?"
   }
   ```

3. **Receive a response**:
   - The server will respond with a JSON object containing the AI's reply.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
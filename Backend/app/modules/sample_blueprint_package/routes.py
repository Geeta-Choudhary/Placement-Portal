from flask import Blueprint, request, jsonify

class SampleBlueprint:
    def __init__(self, logger):  # add self.logger here
        self.logger = logger
        self.blueprint = Blueprint("sample_package_routes", __name__)

        self.blueprint.add_url_rule(
            "/sample-api-1",
            view_func=self.sample_api_1,
            methods=["POST"],
        )

    def sample_api_1(self):
        try:
            # Log the incoming request data for debugging
            self.logger.info("Received request data: %s", request.data)

            # Parse JSON data from the request
            data = request.get_json()

            if not data:
                self.logger.error("No JSON data found in the request")
                return jsonify({"error": "No JSON data found in the request"}), 400

            # Example: Check if a key exists in the payload (e.g., 'name')
            if "name" not in data:
                self.logger.error("'name' field is missing in the request payload")
                return jsonify({"error": "'name' field is missing in the request payload"}), 400
            self.logger.info("Processed request data: %s", data)

            # Example response: Echo the 'name' from the request
            response_data = {"message": f"Hello, {data['name']}!"}
            self.logger.info("Sending response: %s", response_data)

            return jsonify(response_data), 200

        except Exception as e:
            # Log any unexpected errors
            self.logger.error("An error occurred while processing the request: %s", str(e))
            return jsonify({"error": "Internal Server Error"}), 500

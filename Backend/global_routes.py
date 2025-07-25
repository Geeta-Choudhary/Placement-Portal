import json
import os

from flask import Blueprint, jsonify


class GlobalRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.blueprint = Blueprint("global_routes", __name__)

        self.blueprint.add_url_rule(
            "/api/swagger.json",
            view_func=self.get_swagger_spec,
        )
        self.blueprint.add_url_rule(
            "/health",
            view_func=self.health_check,
            methods=["GET"],
        )

    def get_swagger_spec(self):
        """
        Generates the Swagger specification for the API.

        Returns:
        - The Swagger specification in JSON format.
        """
        with self.app.test_request_context():
            for rule in self.app.url_map.iter_rules():
                try:
                    self.spec.path(view=self.app.view_functions[rule.endpoint])
                except Exception as e:
                    pass
        spec_dict = self.spec.to_dict()

        # Load the JSON file with the new paths
        with open(os.path.join(os.path.dirname(__file__), 'swagger_template.json'), 'r') as f:
            temp_spec = json.load(f)

        # Replace the paths in the spec dictionary with those from temp_spec
        if 'paths' in temp_spec:
            temp_spec['paths'] = spec_dict.get('paths', {})

        # Check if 'components' exists in spec_dict, and handle missing 'schemas'
        if 'components' in spec_dict:
            temp_spec['components']['schemas'] = spec_dict['components'].get('schemas', {})
        else:
            # If 'components' is missing, ensure it exists and initialize 'schemas' as an empty object
            temp_spec['components'] = {'schemas': {}}

        # Convert the modified spec to JSON and return as a response
        return jsonify(temp_spec)


    def health_check(self):
        """
        ---
        get:
          summary: Health check
          responses:
            200:
              description: Server is running
        """
        # Return a successful response with a 200 HTTP status code
        return jsonify({"status": "ok", "message": "Server is running"}), 200


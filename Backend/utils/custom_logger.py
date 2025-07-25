import logging


class CustomLogger:
    def __init__(self, name: str, log_level: int = logging.DEBUG):
        """
        Initializes the logger instance with the given name and log level.

        :param name: The name of the logger (usually the module name).
        :param log_level: The logging level to set (default is DEBUG).
        """
        # Create the logger
        self.logger = logging.getLogger(name)
        self.logger.setLevel(log_level)

        # Create a console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)

        # Create a formatter and attach it to the handler
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(formatter)

        # Add the handler to the logger
        self.logger.addHandler(console_handler)

    def get_logger(self) -> logging.Logger:
        """
        Returns the configured logger instance.

        :return: The logger instance.
        """
        return self.logger

from config.celery import app


@app.task(name='animals.process_animal_image')
def process_animal_image(image_id):
    """
    Process an uploaded animal image.

    Placeholder task for future image processing logic such as:
    - Generating thumbnails
    - Optimizing image size
    - Extracting metadata
    """
    # TODO: Implement image processing logic
    pass

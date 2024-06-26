import React, {useEffect, useRef, useState} from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";
import {useNavigate} from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Figure from "react-bootstrap/Figure";
import Image from "react-bootstrap/Image";

import Quill from "quill";
import "quill/dist/quill.snow.css";
import {axiosReq} from "../../api/axiosDefaults";
import Asset from "../../components/Asset";

import Upload from "../../assets/upload.png"
import Spinner from "react-bootstrap/Spinner";
import {toast} from "react-toastify";

function PostCreateForm() {
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleGoBack = () => {
        navigate(-1);
    }

    const [errors, setErrors] = useState({});

    const [postMediaData, setPostMediaData] = useState({
        image: "",
        video: "",
        name: "",
        description: "",
        type: "image",
        is_main_image: true,
    });
    const {image, description, type, is_main_image} = postMediaData;

    const imageInput = useRef(null);

    const [postData, setPostData] = useState({
        title: "",
        content: "",
    });
    const {title, content} = postData;

    const [dogs, setDogs] = useState([]);
    const [selectedDogs, setSelectedDogs] = useState([]);

    const handleChange = (event) => {
        setPostData({
            ...postData,
            [event.target.name]: event.target.value,
        });
    };

    const handleChangeMedia = (event) => {
        if (event.target.files.length) {
            const selectedMedia = event.target.files[0];
            URL.revokeObjectURL(image);
            setPostMediaData({
                ...postMediaData,
                image: URL.createObjectURL(selectedMedia),
                file: selectedMedia,
            })
        }
    }

    useEffect(() => {
        if (!quillRef.current) {
            quillRef.current = new Quill("#editor", {
                theme: "snow",
                modules: {
                    toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                    ],
                },
                placeholder: "Add content to your post",
            });

            quillRef.current.on("text-change", () => {
                setPostData((prevPostData) => ({
                    ...prevPostData,
                    content: quillRef.current.root.innerHTML,
                }));
            });
        }
    }, []);

    useEffect(() => {
        // Fetch the current user's dogs
        const fetchUserDogs = async () => {
            try {
                const response = await axiosReq.get("/dogs/");
                const userDogs = response.data.results.filter(dog => dog.is_owner);
                setDogs(userDogs);
            } catch (err) {
                let message = "Error, please try again later.";
                if (err.response?.data?.detail) {
                    message = err.response?.data?.detail;
                } else if (err.message) {
                    message = err.message;
                }
                toast.error(message);
            }
        };

        fetchUserDogs();
    }, []);

    const handleSelectChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedDogs(selectedOptions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true);
        const formData = new FormData();

        formData.append("title", title)
        formData.append("content", content)

        if (selectedDogs.length > 0 && selectedDogs[0] !== "") {
            selectedDogs.forEach((dog) => {
                formData.append("dogs", dog);
            });
        }

        try {
            const {data} = await axiosReq.post('/posts/', formData);
            await handleSubmitMedia(data.id);
            navigate(`/posts/${data.id}`)
            toast.success("Post created successfully");
        } catch (err) {
            setErrors(err.response?.data)
            toast.warning("Please check your data again");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmitMedia = async (post_id) => {
        if (image.length < 1) {
            navigate(`/posts/${post_id}/`)
        }

        const formData = new FormData();

        formData.append("image", postMediaData.file)
        formData.append("name", title)
        formData.append("description", description)
        formData.append("type", type)
        formData.append("is_main_image", is_main_image)


        try {
            await axiosReq.post(`/medias/post/${post_id}/`, formData);
        } catch (err) {
            setErrors(err.response?.data);
            toast.warning("Please check your data again");
        }
    }

    return (
        <Container>
            <h2 className="text-center my-3">Create a new post</h2>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col className="p-0 p-md-2" sm={12} md={6}>
                        <Container className={appStyles.Content}>
                            <div className="text-center">
                                <Form.Group controlId="title" className="mb-4">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" name="title" value={title} onChange={handleChange} />
                                </Form.Group>
                                {errors?.title?.map((message, idx) => (
                                    <Alert variant="warning" key={idx}>{message}</Alert>
                                ))}
                                <Form.Group controlId="editor" className="mb-4">
                                    <Form.Label>Content</Form.Label>
                                    <div id="editor"></div>
                                </Form.Group>
                                {errors?.content?.map((message, idx) => (
                                    <Alert variant="warning" key={idx}>{message}</Alert>
                                ))}
                                <Form.Group controlId="dogs" className="mt-4">
                                    <Form.Label>Link dogs to the post</Form.Label>
                                    <Form.Select multiple onChange={handleSelectChange}>
                                        <option value="">No dogs</option>
                                        {dogs.map((dog) => (
                                            <option key={dog.id} value={dog.id}>{dog.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <div className="mt-4">
                                    <Button className={`${btnStyles.ReverseButton} ${btnStyles.Button}`}
                                            onClick={handleGoBack} disabled={loading}>
                                        Go back
                                    </Button>
                                    <Button className={`${btnStyles.Button}`} type="submit" disabled={loading}>
                                        {loading ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            "Create Post"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </Col>
                    <Col className="py-2 p-0 p-md-2" sm={12} md={6}>
                        <Container
                            className={`${appStyles.Content} d-flex flex-column justify-content-center`}
                        >
                            <Form.Group className="text-center">
                                {image ? (
                                    <>
                                        <Figure>
                                            <Image className={appStyles.Image} src={image} rounded />
                                        </Figure>
                                        <div>
                                            <Form.Label className={`mb-3 ${btnStyles.Button}`} htmlFor="media-upload">
                                                Change the image
                                            </Form.Label>
                                        </div>
                                    </>
                                ) : (
                                    <Form.Label
                                        className="d-flex justify-content-center"
                                        htmlFor="media-upload"
                                    >
                                        <Asset src={Upload} message="Click or tap to upload an image" />
                                    </Form.Label>
                                )}
                                <Form.Control id="media-upload" type="file"
                                              onChange={handleChangeMedia} ref={imageInput} />
                            </Form.Group>
                            {errors?.image?.map((message, idx) => (
                                <Alert variant="warning" key={idx}>{message}</Alert>
                            ))}
                        </Container>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default PostCreateForm;
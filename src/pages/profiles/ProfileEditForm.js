import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";

import { axiosReq } from "../../api/axiosDefaults";
import {
    useCurrentUser,
    useSetCurrentUser,
} from "../../contexts/CurrentUserContext";

import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";

import {getAllCountries} from "react-country-list";
import Spinner from "react-bootstrap/Spinner";
import {toast} from "react-toastify";

const countries = getAllCountries();

const ProfileEditForm = () => {
    const currentUser = useCurrentUser();
    const setCurrentUser = useSetCurrentUser();
    const { id } = useParams();
    const navigate = useNavigate();
    const imageFile = useRef();
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: "",
        description: "",
        phone_number: "",
        mail_address: "",
        address_1: "",
        address_2: "",
        city: "",
        postcode: "",
        country: "",
    });
    const {
        name,
        description,
        phone_number,
        mail_address,
        address_1,
        address_2,
        city,
        postcode,
        country,
        image
    } = profileData;

    const [errors, setErrors] = useState({});
    const [profileType, setType] = useState({});

    useEffect(() => {
        const handleMount = async () => {
            if (currentUser?.profile_id?.toString() === id) {
                try {
                    const { data } = await axiosReq.get(`/profiles/${id}/`);
                    const {
                        name,
                        description,
                        phone_number,
                        mail_address,
                        address_1,
                        address_2,
                        city,
                        postcode,
                        country,
                        image,
                        type
                    } = data;
                    setProfileData({
                        name,
                        description,
                        phone_number,
                        mail_address,
                        address_1,
                        address_2,
                        city,
                        postcode,
                        country,
                        image
                    });
                    setType(type)
                } catch (err) {
                    let message = "Error, please try again later.";
                if (err.response?.data?.detail) {
                    message = err.response?.data?.detail;
                } else if (err.message) {
                    message = err.message;
                }
                toast.error(message);
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        };

        handleMount();
    }, [currentUser, navigate, id]);

    const handleChange = (event) => {
        setProfileData({
            ...profileData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("phone_number", phone_number);
        formData.append("mail_address", mail_address);
        formData.append("address_1", address_1);
        formData.append("address_2", address_2);
        formData.append("city", city);
        formData.append("postcode", postcode);
        formData.append("country", country);

        if (imageFile?.current?.files && imageFile.current.files[0]) {
            formData.append("image", imageFile?.current?.files[0]);
        }

        try {
            const { data } = await axiosReq.put(`/profiles/${id}/`, formData);
            setCurrentUser((currentUser) => ({
                ...currentUser,
                profile_image: data.image,
            }));
            navigate(-1);
            toast.success("Profile edited successfully");
        } catch (err) {
            setErrors(err.response?.data);
            toast.warning("Please check your data again");
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    }

    const shelterFields = (
        <>
            <Form.Group controlId="phone_number" className="mb-4">
                <Form.Label>Phone number</Form.Label>
                <Form.Control type="text" name="phone_number" value={phone_number} onChange={handleChange} />
            </Form.Group>
            {errors?.phone_number?.map((message, idx) => (
                <Alert variant="warning" key={idx}>{message}</Alert>
            ))}
            <Form.Group controlId="mail_address" className="mb-4">
                <Form.Label>E-Mail address</Form.Label>
                <Form.Control type="text" name="mail_address" value={mail_address} onChange={handleChange} />
            </Form.Group>
            {errors?.mail_address?.map((message, idx) => (
                <Alert variant="warning" key={idx}>{message}</Alert>
            ))}
            <Form.Group controlId="address_1" className="mb-4">
                <Form.Label>Address 1</Form.Label>
                <Form.Control type="text" name="address_1" value={address_1} onChange={handleChange} />
            </Form.Group>
            {errors?.address_1?.map((message, idx) => (
                <Alert variant="warning" key={idx}>{message}</Alert>
            ))}
            <Form.Group controlId="address_2" className="mb-4">
                <Form.Label>Address 2</Form.Label>
                <Form.Control type="text" name="address_2" value={address_2} onChange={handleChange} />
            </Form.Group>
            {errors?.address_2?.map((message, idx) => (
                <Alert variant="warning" key={idx}>{message}</Alert>
            ))}
            <Form.Group controlId="city" className="mb-4">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" name="city" value={city} onChange={handleChange} />
            </Form.Group>
            {errors?.city?.map((message, idx) => (
                <Alert variant="warning" key={idx}>{message}</Alert>
            ))}
            <Form.Group controlId="postcode" className="mb-4">
                <Form.Label>Postcode</Form.Label>
                <Form.Control type="text" name="postcode" value={postcode} onChange={handleChange} />
            </Form.Group>
            {errors?.postcode?.map((message, idx) => (
                <Alert variant="warning" key={idx}>{message}</Alert>
            ))}
        </>
    );

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col className="p-0 p-md-2" sm={12} md={6}>
                        <Container className={appStyles.Content}>
                            <div className="text-center">
                                <Form.Group controlId="name" className="mb-4">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" name="name" value={name} onChange={handleChange} />
                                </Form.Group>
                                {errors?.name?.map((message, idx) => (
                                    <Alert variant="warning" key={idx}>{message}</Alert>
                                ))}
                                <Form.Group controlId="description" className="mb-4">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" name="description" value={description} onChange={handleChange} rows={7} />
                                </Form.Group>
                                {errors?.description?.map((message, idx) => (
                                    <Alert variant="warning" key={idx}>{message}</Alert>
                                ))}
                                {profileType === "shelter" && (
                                    <>
                                        {shelterFields}
                                    </>
                                )}
                                <Form.Group controlId="country" className="mb-4">
                                    <Form.Label>Country</Form.Label>
                                    <Form.Select name="country" value={country} onChange={handleChange}>
                                        <option key="" value="">Select a country</option>

                                        {countries.map((countryOption) => (
                                            <option key={countryOption.name} value={countryOption.name}>
                                                {countryOption.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                {errors?.country?.map((message, idx) => (
                                    <Alert variant="warning" key={idx}>{message}</Alert>
                                ))}

                                <div className="mt-4">
                                    <Button className={`${btnStyles.ReverseButton} ${btnStyles.Button}`}
                                            onClick={handleGoBack} disabled={loading}>
                                        Go back
                                    </Button>
                                    <Button className={`${btnStyles.Button}`} type="submit" disabled={loading}>
                                        {loading ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            "Save Changes"
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
                                {image && (
                                    <figure>
                                        <Image src={image} fluid />
                                    </figure>
                                )}
                                {errors?.image?.map((message, idx) => (
                                    <Alert variant="warning" key={idx}>
                                        {message}
                                    </Alert>
                                ))}
                                <div>
                                    <Form.Label
                                        className={`${btnStyles.Button} btn mt-auto mb-3`}
                                        htmlFor="image-upload">
                                        Change the image
                                    </Form.Label>
                                </div>
                                <Form.Control id="image-upload" type="file"
                                              onChange={(e) => {
                                                  if (e.target.files.length) {
                                                      setProfileData({
                                                          ...profileData,
                                                          image: URL.createObjectURL(e.target.files[0]),
                                                      });
                                                  }
                                              }} ref={imageFile} />
                            </Form.Group>
                        </Container>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default ProfileEditForm;
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import {removeTokenTimestamp, shouldRefreshToken} from "../utils/utils";
import Asset from "../components/Asset";
import {toast} from "react-toastify";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();
export const ShelterUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);
export const useIsShelterUser = () => useContext(ShelterUserContext);

export const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isShelterUser, setIsShelterUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleMount = useCallback(async () => {
        try {
            const { data } = await axiosRes.get("dj-rest-auth/user/");
            setCurrentUser(data);

            if (data.profile_id) {
                const profileResponse = await axiosReq.get(`/profiles/${data.profile_id}/`);
                setIsShelterUser(profileResponse.data.type === "shelter");
            }
        } catch (err) {

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        handleMount();
    }, []);

    useEffect(() => {
        if (currentUser && currentUser.profile_id) {
            const checkShelterUser = async () => {
                try {
                    const profileResponse = await axiosReq.get(`/profiles/${currentUser.profile_id}/`);
                    setIsShelterUser(profileResponse.data.type === "shelter");
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
            checkShelterUser();
        } else {
            setIsShelterUser(false);
        }
    }, [currentUser]);

    const contextValue = useMemo(() => currentUser, [currentUser]);
    const setContextValue = useMemo(() => setCurrentUser, []);
    const shelterContextValue = useMemo(() => isShelterUser, [isShelterUser]);

    useMemo(() => {
        axiosReq.interceptors.request.use(
            async (config) => {
                if (shouldRefreshToken()) {
                    try {
                        await axios.post("/dj-rest-auth/token/refresh/");
                    } catch (err) {
                        setCurrentUser((prevCurrentUser) => {
                            if (prevCurrentUser) {
                                toast.info("You are logged out.");
                                navigate("/signin");
                            }
                            return null;
                        });
                        removeTokenTimestamp();
                        return config;
                    }
                }
                return config;
            },
            (err) => {
                return Promise.reject(err);
            }
        );

        axiosRes.interceptors.response.use(
            (response) => response,
            async (err) => {
                if (err.response?.status === 401) {
                    try {
                        await axios.post("/dj-rest-auth/token/refresh/");
                    } catch (err) {
                        setCurrentUser((prevCurrentUser) => {
                            if (prevCurrentUser) {
                                toast.info("You are logged out.");
                                navigate("/signin");
                            }
                            return null;
                        });
                        removeTokenTimestamp();
                    }
                    return axios(err.config);
                }
                return Promise.reject(err);
            }
        );
    }, [navigate]);

    return (
        <CurrentUserContext.Provider value={contextValue}>
            <SetCurrentUserContext.Provider value={setContextValue}>
                <ShelterUserContext.Provider value={shelterContextValue}>
                    {loading ? <Asset spinner /> : children}
                </ShelterUserContext.Provider>
            </SetCurrentUserContext.Provider>
        </CurrentUserContext.Provider>
    );
};

CurrentUserProvider.propTypes = {
    children: PropTypes.node,
};
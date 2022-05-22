import React, { Component } from 'react';
import Master from '../elements/Master';
import Env from '../config/env.config';
import { strings as commonStrings } from '../lang/common';
import { strings as ccStrings } from '../lang/create-company';
import { strings } from '../lang/create-user';
import Helper from '../common/Helper';
import UserService from '../services/UserService';
import CompanyService from '../services/CompanyService';
import Error from '../elements/Error';
import Backdrop from '../elements/SimpleBackdrop';
import { Avatar } from '../elements/Avatar';
import DatePicker from '../elements/DatePicker';
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper,
    Select,
    MenuItem
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import validator from 'validator';
import { toast } from 'react-toastify';

import '../assets/css/create-user.css';

export default class CreateUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            admin: false,
            fullName: '',
            email: '',
            phone: '',
            location: '',
            bio: '',
            error: false,
            emailError: false,
            visible: false,
            loading: false,
            fullNameError: false,
            avatar: null,
            avatarError: false,
            type: '',
            birthDate: null,
            emailValid: true,
        };
    }

    handleUserTypeChange = (e) => {
        this.setState({ type: e.target.value }, async () => await this.validateFullName(this.state.fullName));
    };

    handleOnChangeFullName = (e) => {
        this.setState({
            fullName: e.target.value,
        });

        if (!e.target.value) {
            this.setState({ fullNameError: false });
        }
    };

    validateFullName = async (fullName) => {
        if (fullName) {
            if (this.state.type === Env.RECORD_TYPE.COMPANY) {

                const status = await CompanyService.validate({ fullName });
                if (status === 200) {
                    this.setState({ fullNameError: false });
                    return true;
                } else {
                    this.setState({ fullNameError: true, avatarError: false, error: false });
                    return false;
                }

            } else {
                this.setState({ fullNameError: false });
                return true;
            }
        } else {
            this.setState({ fullNameError: false });
            return true;
        }
    };

    handleFullNameOnBlur = async (e) => {
        await this.validateFullName(e.target.value);
    };

    handleOnChangeEmail = (e) => {
        this.setState({
            email: e.target.value,
        });

        if (!e.target.value) {
            this.setState({ emailError: false, emailValid: true });
        }
    };

    validateEmail = async (email) => {
        if (email) {
            if (validator.isEmail(email)) {
                try {
                    const status = await UserService.validateEmail({ email });
                    if (status === 200) {
                        this.setState({ emailError: false, emailValid: true });
                        return true;
                    } else {
                        this.setState({ emailError: true, emailValid: true, avatarError: false, error: false });
                        return false;
                    }
                } catch (err) {
                    toast(commonStrings.GENERIC_ERROR, { type: 'error' });
                    this.setState({ emailError: false, emailValid: true });
                    return false;
                }
            } else {
                this.setState({ emailError: false, emailValid: false });
                return false;
            }
        } else {
            this.setState({ emailError: false, emailValid: true });
            return false;
        }
    };

    handleEmailOnBlur = async (e) => {
        await this.validateEmail(e.target.value);
    };

    handleOnChangePhone = (e) => {
        this.setState({
            phone: e.target.value,
        });
    };

    handleOnChangeLocation = (e) => {
        this.setState({
            location: e.target.value,
        });
    };

    handleOnChangeBio = (e) => {
        this.setState({
            bio: e.target.value,
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const { email, type, fullName } = this.state;

        const emailValid = await this.validateEmail(email);
        if (!emailValid) {
            return;
        }

        const fullNameValid = await this.validateFullName(fullName);
        if (!fullNameValid) {
            return;
        }

        if (type === Env.RECORD_TYPE.COMPANY && !this.state.avatar) {
            this.setState({
                avatarError: true,
                error: false
            });
            return;
        }

        this.setState({ loading: true });

        const {
            admin,
            user,
            phone,
            location,
            bio,
            avatar,
            birthDate } = this.state;

        const language = UserService.getLanguage();
        const company = admin ? undefined : user._id;

        const data = { email, phone, location, bio, fullName, type, avatar, birthDate, language, company };

        UserService.create(data)
            .then(status => {
                if (status === 200) {
                    window.location = '/users';
                } else {
                    this.setState({
                        error: true,
                        loading: false
                    });
                }
            }).catch(() => {
                this.setState({
                    error: true,
                    loading: false
                });
            });

    };

    handleChange = (e) => {
        e.preventDefault();
    };

    onBeforeUpload = () => {
        this.setState({ loading: true });
    };

    onAvatarChange = (avatar) => {
        const { type } = this.state;

        this.setState({ loading: false, avatar });

        if (avatar !== null && type === Env.RECORD_TYPE.COMPANY) {
            this.setState({ avatarError: false });
        }
    };

    handleCancel = () => {
        const { avatar } = this.state;

        if (avatar) {
            this.setState({ loading: true });

            UserService.deleteTempAvatar(avatar)
                .then(() => {
                    window.location.href = '/users';
                })
                .catch(() => {
                    window.location.href = '/users';
                });
        } else {
            window.location.href = '/users';
        }
    };

    onLoad = (user) => {
        const admin = Helper.admin(user);
        this.setState({ user: user, admin, visible: true, type: admin ? '' : Env.RECORD_TYPE.USER });
    }

    componentDidMount() {
    }

    render() {
        const {
            user,
            admin,
            type,
            error,
            emailError,
            fullNameError,
            avatarError,
            visible,
            loading,
            birthDate,
            emailValid
        } = this.state,
            company = type === Env.RECORD_TYPE.COMPANY,
            driver = type === Env.RECORD_TYPE.USER;

        return (
            <Master onLoad={this.onLoad} strict={true}>
                {user && <div className='create-user'>
                    <Paper className="user-form user-form-wrapper" elevation={10} style={visible ? null : { display: 'none' }}>
                        <h1 className="user-form-title"> {strings.CREATE_COMPANY_HEADING} </h1>
                        <form onSubmit={this.handleSubmit}>
                            <Avatar
                                type={type}
                                mode='create'
                                record={null}
                                size='large'
                                readonly={false}
                                onBeforeUpload={this.onBeforeUpload}
                                onChange={this.onAvatarChange}
                                color='disabled'
                                className='avatar-ctn'
                            />

                            {company && <div className='info'>
                                <InfoIcon />
                                <label>
                                    {ccStrings.RECOMMENDED_IMAGE_SIZE}
                                </label>
                            </div>}

                            {admin &&
                                <FormControl fullWidth margin="dense" style={{ marginTop: company ? 0 : 39 }}>
                                    <InputLabel className='required'>{commonStrings.TYPE}</InputLabel>
                                    <Select
                                        label={commonStrings.TYPE}
                                        value={type}
                                        onChange={this.handleUserTypeChange}
                                        variant='standard'
                                        required
                                        fullWidth
                                    >
                                        <MenuItem value={Env.RECORD_TYPE.ADMIN}>{Helper.getUserType(Env.RECORD_TYPE.ADMIN)}</MenuItem>
                                        <MenuItem value={Env.RECORD_TYPE.COMPANY}>{Helper.getUserType(Env.RECORD_TYPE.COMPANY)}</MenuItem>
                                        <MenuItem value={Env.RECORD_TYPE.USER}>{Helper.getUserType(Env.RECORD_TYPE.USER)}</MenuItem>
                                    </Select>
                                </FormControl>
                            }

                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                                <Input
                                    id="full-name"
                                    type="text"
                                    error={fullNameError}
                                    required
                                    onBlur={this.handleFullNameOnBlur}
                                    onChange={this.handleOnChangeFullName}
                                    autoComplete="off"
                                />
                                <FormHelperText error={fullNameError}>
                                    {(fullNameError && ccStrings.INVALID_COMPANY_NAME) || ''}
                                </FormHelperText>
                            </FormControl>

                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                                <Input
                                    id="email"
                                    type="text"
                                    error={!emailValid || emailError}
                                    onBlur={this.handleEmailOnBlur}
                                    onChange={this.handleOnChangeEmail}
                                    autoComplete="off"
                                    required
                                />
                                <FormHelperText error={!emailValid || emailError}>
                                    {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                                    {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                                </FormHelperText>
                            </FormControl>

                            {driver &&
                                <FormControl fullWidth margin="dense">
                                    <DatePicker
                                        label={strings.BIRTH_DATE}
                                        value={birthDate}
                                        required
                                        onChange={(birthDate) => {
                                            this.setState({ birthDate });
                                        }}
                                        language={(user && user.language) || Env.DEFAULT_LANGUAGE}
                                    />
                                </FormControl>
                            }

                            <div className='info'>
                                <InfoIcon />
                                <label>{commonStrings.OPTIONAL}</label>
                            </div>

                            <FormControl fullWidth margin="dense">
                                <InputLabel>{commonStrings.PHONE}</InputLabel>
                                <Input
                                    id="phone"
                                    type="text"
                                    onChange={this.handleOnChangePhone}
                                    inputProps={{
                                        autoComplete: 'new-phone',
                                        form: {
                                            autoComplete: 'off',
                                        },
                                    }}
                                />
                            </FormControl>

                            <FormControl fullWidth margin="dense">
                                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                                <Input
                                    id="location"
                                    type="text"
                                    onChange={this.handleOnChangeLocation}
                                    autoComplete="off"
                                />
                            </FormControl>

                            <FormControl fullWidth margin="dense">
                                <InputLabel>{commonStrings.BIO}</InputLabel>
                                <Input
                                    id="bio"
                                    type="text"
                                    onChange={this.handleOnChangeBio}
                                    autoComplete="off"
                                />
                            </FormControl>

                            <div className="buttons">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className='btn-primary btn-margin-bottom'
                                    size="small"
                                >
                                    {commonStrings.CREATE}
                                </Button>
                                <Button
                                    variant="contained"
                                    className='btn-secondary btn-margin-bottom'
                                    size="small"
                                    onClick={this.handleCancel}
                                >
                                    {commonStrings.CANCEL}
                                </Button>
                            </div>

                            <div className="form-error">
                                {error && <Error message={commonStrings.GENERIC_ERROR} />}
                                {avatarError && <Error message={commonStrings.IMAGE_REQUIRED} />}
                            </div>
                        </form>

                    </Paper>
                </div>}
                {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
            </Master>
        );
    }
}
import React, { Component } from 'react';
import { strings as commonStrings } from '../lang/common';
import Helper from '../common/Helper';

import '../assets/css/status-filter.css';

class StatusFilter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            statuses: [],
            checkedStatuses: [],
            allStatusesChecked: true
        }
    }

    handleStatusClick = (e) => {
        const checkbox = e.currentTarget.previousSibling;
        checkbox.checked = !checkbox.checked;
        const event = e;
        event.currentTarget = checkbox;
        this.handleCheckStatusChange(event);
    };

    handleCheckStatusChange = (e) => {
        const { checkedStatuses } = this.state;
        const status = e.currentTarget.getAttribute('data-value');

        if (e.currentTarget.checked) {
            checkedStatuses.push(status);
        } else {
            const index = checkedStatuses.findIndex(s => s === status);
            checkedStatuses.splice(index, 1);
        }

        this.setState({ checkedStatuses }, () => {
            if (this.props.onChange) {
                this.props.onChange(checkedStatuses);
            }
        });
    };

    handleUncheckAllChange = (e) => {
        const { allStatusesChecked } = this.state;
        const checkboxes = document.querySelectorAll('.status-checkbox');

        if (allStatusesChecked) { // uncheck all
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            this.setState({ allStatusesChecked: false, checkedStatuses: [] });
        } else { // check all
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });

            const statuses = this.state.statuses.map(status => status.value);
            this.setState({ allStatusesChecked: true, checkedStatuses: statuses }, () => {
                if (this.props.onChange) {
                    this.props.onChange(statuses);
                }
            });
        }
    };

    componentDidMount() {
        const statuses = Helper.getBookingStatuses();

        this.setState({ statuses, checkedStatuses: Helper.clone(statuses.map(status => status.value)) }, () => {
            const checkboxes = document.querySelectorAll('.status-checkbox');

            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });

            if (this.props.onLoad) {
                this.props.onLoad(this.state.checkedStatuses);
            }
        });
    }

    render() {
        const { statuses, allStatusesChecked } = this.state;

        return (
            statuses.length > 0 ? (
                <div className={`${this.props.className ? `${this.props.className} ` : ''}status-filter`}>
                    <ul className='status-list'>
                        {
                            statuses.map(status => (
                                <li key={status.value}>
                                    <input type='checkbox' data-value={status.value} className='status-checkbox' onChange={this.handleCheckStatusChange} />
                                    <label onClick={this.handleStatusClick} className={`bs bs-${status.value}`}>{Helper.getBookingStatus(status.value)}</label>
                                </li>
                            ))
                        }
                    </ul>
                    <div className='filter-actions'>
                        <span onClick={this.handleUncheckAllChange} className='uncheckall'>
                            {allStatusesChecked ? commonStrings.UNCHECK_ALL : commonStrings.CHECK_ALL}
                        </span>
                    </div>
                </div>
            )
                :
                <></>
        );
    }
}

export default StatusFilter;
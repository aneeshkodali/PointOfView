import React, { Component } from 'react';
import { Container, ListGroup, ListGroupItem, Button } from 'reactstrap';
//import { CSSTransition, TransitionGroup } from 'react-transition';

class Matches extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matches: [
                {'_id': '5f3ae51fb19b4eb558abd4be', 'suffix': '20190714-M-Wimbledon-F-Roger_Federer-Novak_Djokovic.html', 'title': '2019 Wimbledon F: Roger Federer vs Novak Djokovic'},
                {'_id': '5f3bbf67c62314acac734d36', 'suffix': '20170715-W-Wimbledon-F-Venus_Williams-Garbine_Muguruza.html', 'title': '2017 Wimbledon F: Venus Williams vs Garbine Muguruza'}
            ]
        }
    }

    render() {
        const { matches } = this.state;
        return (
            <Container>
                <ListGroup>
                    {matches.map(({_id, title}) => (
                        <ListGroupItem>
                            {title}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </Container>
        )
    }
}

export default Matches;

import React from 'react';

import {
    Dimmer,
    Loader,
    Modal,
    Form,
    TextArea,
} from 'semantic-ui-react';

export default ({ exportModal, onClose }) => (
    <Modal
        open={ exportModal.open }
        onClose={ onClose }>
        <Modal.Header>Here is what you ordered</Modal.Header>
        <Modal.Content>
            {
                exportModal.loading === true &&
                <Dimmer inverted active>
                    <Loader inverted>Exporting...</Loader>
                </Dimmer>
            }
            <Form>
                <TextArea
                    value={ exportModal.content }
                    style={{ height: 350 }}
                />
            </Form>
        </Modal.Content>
        <Modal.Actions
            actions={[
                { key: 'no', content: 'No', color: 'red', triggerClose: true },
                { key: 'yes', content: 'Yes', color: 'green', triggerClose: true },
            ]} />
    </Modal>
);

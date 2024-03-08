

export const buildFeedbackRubricMap = (client_feedback) => {
    const feedbackRubricMap = {};
    const gradingInfo = client_feedback?.gradingInfo || [];
    for (let i = 0; i < gradingInfo.length; i++) {
        let exnetID;

        if (gradingInfo[i].hasOwnProperty('exNetConnectorID')) {
            exnetID = gradingInfo[i].exNetConnectorID;
        } else {
            exnetID = gradingInfo[i].exnetID;
        }

        feedbackRubricMap[exnetID] = gradingInfo[i];
    }

    return feedbackRubricMap;
}
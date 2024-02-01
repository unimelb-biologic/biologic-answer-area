

export const buildFeedbackRubricMap = (client_feedback) => {

    const feedbackRubricMap = {};
    const gradingInfo = client_feedback?.gradingInfo || [];
    for (let i = 0; i < gradingInfo.length; i++) {
        const {exnetID} = gradingInfo[i];
        feedbackRubricMap[exnetID] = gradingInfo[i];
    }

    return feedbackRubricMap;
}
import Resolver from '@forge/resolver';
import api from '@forge/api';

const resolver = new Resolver();

resolver.define('getDetails', async (req) => {
    try {
        const response = await api.fetch("https://gitlab.com/api/v4/projects/59538669/merge_requests");
        const data = await response.json();

        const firstCommitDate = await getFirstCommitDate();

        const detailedData = data.map(mr => {
            const createdDate = new Date(mr.created_at);
            const now = new Date();

           
            const prCloseDate = mr.state === 'merged' ? new Date(mr.merged_at) : now;
            const devTime = prCloseDate - createdDate;

            // Rev time
            const revTime = prCloseDate - createdDate;

            return {
                title: mr.title,
                assignees: mr.assignees ? mr.assignees.map(a => a.name).join(', ') : 'None',
                reviewers: mr.reviewers ? mr.reviewers.map(r => r.name).join(', ') : 'None',
                age: formatDuration(now - createdDate),
                devTime: formatDuration(devTime),
                revTime: formatDuration(revTime),
            };
        });

        const openMergeRequests = data.filter(mr => mr.state === 'opened');
        const openMergeRequestDate = openMergeRequests.length > 0 ? openMergeRequests[0].created_at : 'N/A';
        const completedMergeRequestDates = data.filter(mr => mr.state === 'merged').map(mr => mr.merged_at);

        const devTime = detailedData.length > 0 ? detailedData[0].devTime : 'N/A';
        const revTime = detailedData.length > 0 ? detailedData[detailedData.length - 1].revTime : 'N/A';

        return {
            firstCommitDate,
            numberOfOpenMergeRequests: openMergeRequests.length,
            openMergeRequestDate,
            completedMergeRequestDates,
            data: detailedData,
            devTime,
            revTime,
        };

    } catch (error) {
        console.error('Error fetching data from GitLab:', error);
        return { error: 'Failed to fetch data' };
    }
});

async function getFirstCommitDate() {
    try {
        const response = await api.fetch("https://gitlab.com/api/v4/projects/59538669/repository/commits");
        const data = await response.json();
        return data.length > 0 ? data[0].created_at : 'N/A';
    } catch (error) {
        console.error('Error fetching first commit date:', error);
        return 'N/A';
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days} days ${hours % 24} hours ${minutes % 60} minutes ${seconds % 60} seconds`;
}

export const handler = resolver.getDefinitions();

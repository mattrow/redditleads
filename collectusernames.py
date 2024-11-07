import praw
import csv
from praw.models import MoreComments

# This info is needed to connect the account and the program
secret = "lepRFkfq600aHiTKUFXi_TtKzCG5hg"
ID = "KBH56Y5iqBPABsrVnItKOQ"

reddit = praw.Reddit(
    client_id=ID,
    client_secret=secret,
    user_agent="redleads",
    username="wpaindustries",
    password="Toronto77",
)

# specify the subreddit you want to search in
subreddit = reddit.subreddit('onlineeslteaching')

# create an empty list to store the usernames
usernames = []

# iterate over all submissions and comments in the subreddit
for submission in subreddit.top(limit=99999):
    if submission.author is not None:
        # add the username of the submitter to the list
        usernames.append(submission.author.name)
    # replace all MoreComments objects with their child comments
        submission.comments.replace_more(limit=1000)
   # iterate over all comments in the submission, including child comments
    for comment in submission.comments.list():
        # check if the comment is not a MoreComments object and has an associated author
        if not isinstance(comment, MoreComments) and comment.author is not None:
            # add the username of the commenter to the set
            usernames.extend([comment.author.name])

# remove duplicates from the list of usernames
usernames = list(set(usernames))

# write the usernames to a CSV file
with open('usernames_onlineeslteaching.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    for username in usernames:
        writer.writerow([username])

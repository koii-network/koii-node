# App Notifications

## Staking Key Top Up Notifications

### Balance Below Threshold Notification

- **Banner Triggered:** YES
- **Triggering Event:** User's staking balance drops below 5 KOII. Notification repeats for each decrement until balance reaches 1 KOII.
- **Notification Text:** Your staking key's funds are getting low. Top up now to make sure your node is safe.
- **CTA:** Fund Now - triggers Fund staking key flow explained here.

### Critical Balance Notification

- **Banner Triggered:** YES
- **Triggering Event:** User's staking balance gets below 0.5 KOII.
- **Notification Text:** Your staking key is below 1 KOII. Fund now to keep your node in the network.
- **CTA:** Fund Now - triggers Fund staking key flow explained here.

## Task Notifications

### Task Upgrade Available

- **Banner Triggered:** YES
- **Triggering Event:** Task is upgraded and user is notified by the task state changing to Upgrade state.
- **Notification Text:** Upgrade [task name] now to keep earning!
- **CTA:** Upgrade Now - triggers Upgrade task flow here.
  - Hide CTA if the user has already updated the task or if the upgrade is no longer available.

### New Task Availability

- **Banner Triggered:** NO
- **Triggering Event:** A new task is introduced into the network and listed as available.
- **Notification Text:** A New task is now available! Check out [task name] in "Add Tasks" to run it!
- **CTA:** Add Tasks - Opens "Available task" view.

### Task Blacklisted/Delisted/Removed

- **Banner Triggered:** YES (implementation needed, informative type with color #BEF0ED)
- **Triggering Event:** Task is removed from the network after being run by the user. Banner appears after the cool down period.
- **Notification Text:** [task name] was delisted but don't worry your rewards and stake are safe and ready to withdraw!
- **CTA:** Claim and Archive - triggers unstake process with a loading animation and archives the task after success toast.

### Task Out of Bounty

- **Banner Triggered:** NO
- **Triggering Event:** Bounty is too low to cover rewards or to function.
- **Notification Text:** [task name]'s bounty is empty. The creator needs to refill it before you can run this task again.
- **CTA:** No CTA

## Security and Maintenance Notifications

### Back Up Secret Phrase

- **Banner Triggered:** YES (implementation needed, informative type with color #BEF0ED)
- **Triggering Event:** User skips backup of secret phrase and is reminded after their 3rd Node launch.
- **Notification Text:** Keep your keys safe! Back up your secret phrase now.
- **CTA:** Back Up Now - opens Export secret phrase Modal.

### Computer Reaching Max Capacity

- **Banner Triggered:** YES (needs confirmation if implemented, warnings type with color #FFC78F)
- **Triggering Event:** Detection of machine reaching CPU/RAM max capacity.
- **Notification Text:** Your machine is reaching full capacity, pause tasks to avoid overload.
- **CTA:** Pause Tasks - Pauses all tasks and navigates user to manage their node.

## Reward Notifications

### Claimed Rewards

- **Banner Triggered:** NO
- **Triggering Event:** User claims rewards.
- **Notification Text:** You just claimed [# of KOII] KOII for running tasks in the network!
- **CTA:** Explore block - opens block explorer for the transaction.

### First Rewards for New Task

- **Banner Triggered:** NO
- **Triggering Event:** User earns rewards for the first time on a new task.
- **Notification Text:** Congrats, [task name] is earning rewards!
- **CTA:** Claim Rewards - triggers the claim reward action.

### Update Available

- **Banner Triggered:** Check why it's not appearing; it only shows at the system level but not in the notification center.
- **Triggering Event:** Update released and ready for installation.
- **Notification Text:** A new version of the node is ready for you!
- **CTA:** Update Now - triggers new version download/install.

### Archiving Successful

- **Banner Triggered:** NO
- **Triggering Event:** Task has been archived by the user.
- **Notification Text:** [task name] has been archived.
- **CTA:** See History - opens the user's task block explorer.

### Session Started from Scheduler

- **Banner Triggered:** NO (possible toast notification needed)
- **Triggering Event:** Node starts running tasks set by the scheduler feature.
- **Notification Text:** A new session has just started running. Manage your node's automated work.
- **CTA:** Automate Node.

### Started a Task

- **Banner Triggered:** NO
- **Triggering Event:** User starts a task.
- **Notification Text:** You've started [task name].
- **CTA:** No CTA

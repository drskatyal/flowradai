import logger from "../core/logger";
import mailchimpService from "../web/mailchimp/mailchimp-service";
import UserModel from "../web/user/user-model";

export const seedContacts = async () => {
  try {
    const contacts = await UserModel.find({});

    logger.info?.(`Found ${contacts.length} users to sync with Mailchimp.`);

    for (const contact of contacts) {
      try {
        const { email, firstName, lastName } = contact;

        if (!email) {
          logger.warn?.(
            `Skipping user ID ${contact._id} - missing email`
          );
          continue;
        }

        // logger.info(`conatct-${email}-${firstName}-${lastName}`);

        const response = await mailchimpService.addOrUpdateUser({
          email,
          firstName: firstName || "",
          lastName: lastName || "",
        });

        logger.info?.(
          `Mailchimp sync success for ${email} | Status: ${response?.status ?? "OK"}`
        );

      } catch (err) {
        logger.error?.(
          `Mailchimp sync failed for user ID ${contact._id} (${contact.email})`,
          err
        );
      }
    }

    logger.info?.("All contacts synced to Mailchimp successfully!");
  } catch (err) {
    logger.error?.("Error fetching users from DB:", err);
  }
};
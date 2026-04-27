import moment from "moment";

export const formatDate = (dateString: string) => {
  return moment(dateString).format("MMMM D, YYYY [at] h:mm A");
};

import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { getBaseUrl } from '@/utils/get_base_url';
import { requester, Resp } from '@/utils/requester';

async function create({
  uid,
  title,
  desc,
  startDate,
  endDate,
}: {
  uid: string;
  title: string;
  desc?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Resp<{ instantEventId: string }>> {
  const url = '/api/instant-event.create';
  try {
    const postData = {
      uid,
      title,
      desc,
      startDate,
      endDate,
    };
    const resp = await requester<{ instantEventId: string }>({
      option: {
        url,
        method: 'POST',
        data: postData,
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function get({
  uid,
  instantEventId,
  isServer = false,
}: {
  uid: string;
  instantEventId: string;
  isServer?: boolean;
}): Promise<Resp<InInstantEvent>> {
  const hostAndPort: string = getBaseUrl(isServer);
  const url = `${hostAndPort}/api/instant-event.info/${uid}/${instantEventId}`;
  try {
    const resp = await requester<InInstantEvent>({
      option: {
        url,
        method: 'GET',
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function post({
  uid,
  instantEventId,
  message,
}: {
  uid: string;
  instantEventId: string;
  message: string;
}): Promise<Resp<unknown>> {
  const url = '/api/instant-event.messages.add';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'POST',
        data: {
          uid,
          instantEventId,
          message,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function postReply({
  uid,
  instantEventId,
  messageId,
  reply,
  author,
}: {
  uid: string;
  instantEventId: string;
  messageId: string;
  reply: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  const url = `/api/instant-event.messages.add.reply/${uid}/${instantEventId}/${messageId}`;
  try {
    const sendData: {
      reply: string;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = { reply };
    if (author !== undefined) {
      sendData.author = author;
    }
    const resp = await requester({
      option: {
        url,
        method: 'POST',
        data: sendData,
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function getMessageInfo({
  uid,
  instantEventId,
  messageId,
}: {
  uid: string;
  instantEventId: string;
  messageId: string;
}): Promise<Resp<InInstantEventMessage>> {
  const url = `/api/instant-event.messages.info/${uid}/${instantEventId}/${messageId}`;
  try {
    const resp = await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'GET',
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

const InstantMessageClientService = {
  create,
  get,
  post,
  postReply,
  getMessageInfo,
};

export default InstantMessageClientService;
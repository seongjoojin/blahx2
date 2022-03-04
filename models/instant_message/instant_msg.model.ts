import CustomServerError from '@/controllers/custom_error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';
import { InInstantEvent } from './interface/in_instant_event';

const INSTANT_MESSAGE = 'instants';
const MEMBER_COLLECTION = 'members';

/** instant 이벤트 생성 */
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
}) {
  const memberCollection = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION);
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION).doc(uid);
  const memberDoc = await memberRef.get();
  // 존재하지 않는 사용자
  if (memberDoc.exists === false) {
    throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자에게 질문을 보내고 있네요 ☠️' });
  }
  const newInstantEventBody: {
    title: string;
    desc?: string;
    startDate?: string;
    endDate?: string;
  } = {
    title,
  };
  if (desc !== undefined) {
    newInstantEventBody.desc = desc;
  }
  if (startDate !== undefined) {
    newInstantEventBody.startDate = startDate;
  }
  if (endDate !== undefined) {
    newInstantEventBody.endDate = endDate;
  }
  const newInstantEventRef = await memberCollection.add(newInstantEventBody);
  return newInstantEventRef.id;
}

/** instant 이벤트 정보를 조회 */
async function get({ uid, instantEventId }: { uid: string; instantEventId: string }) {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION).doc(uid);
  const eventRef = FirebaseAdmin.getInstance()
    .Firestore.collection(MEMBER_COLLECTION)
    .doc(uid)
    .collection(INSTANT_MESSAGE)
    .doc(instantEventId);
  const infoResp: InInstantEvent = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const eventDoc = await transaction.get(eventRef);
    // 존재하지 않는 사용자
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자에게 질문을 보내고 있네요 ☠️' });
    }
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트에 질문을 보내고 있네요 ☠️' });
    }
    const info = eventDoc.data() as InInstantEvent;
    return {
      ...info,
      instantEventId: eventDoc.id,
    };
  });
  return infoResp;
}
/** instant 이벤트에 질문 등록 */
async function post({ uid, eventId, message }: { uid: string; eventId: string; message: string }) {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION).doc(uid);
  const eventRef = FirebaseAdmin.getInstance()
    .Firestore.collection(MEMBER_COLLECTION)
    .doc(uid)
    .collection(INSTANT_MESSAGE)
    .doc(eventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const eventDoc = await transaction.get(eventRef);
    // 존재하지 않는 사용자
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자에게 질문을 보내고 있네요 ☠️' });
    }
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트에 질문을 보내고 있네요 ☠️' });
    }
    const newPostRef = memberRef.collection(INSTANT_MESSAGE).doc();
    await transaction.create(newPostRef, { message });
  });
}

const InstantMessageModel = {
  create,
  post,
  get,
};

export default InstantMessageModel;

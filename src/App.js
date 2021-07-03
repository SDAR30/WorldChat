import './App.css';
import React, { useRef, useState } from 'react';
import firebase from 'firebase/app'
import 'firebase/firestore'; //for database
import 'firebase/auth'; //for user authentication

//hooks to make it easier to work with firebase
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData}  from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  
})

const auth = firebase.auth(); //reference to auth sdk
const firestore = firebase.firestore() //reference to firestore sdk

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️ WORLD CHAT💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

 /*Use firebase SDK  to authenticate using google account*/
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //create instance of google provider object
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign In</button>
      <p>Say what you want with everyone in the world!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('chatmessage');
  const query = messagesRef.orderBy('createdAt').limit(50);

  //react hook, listens to data in real time.
  const [messages] = useCollectionData(query, { idField: 'id' }); 

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => { //*********SEND MESSAGE */
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    //create new document in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL: photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }//***************************SEND MESSAGE */

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}//********CHAT ROOM */


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="user"/>
      <p>{text}</p>
    </div>
  </>)
}


export default App;

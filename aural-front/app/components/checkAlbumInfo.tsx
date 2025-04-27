// app/components/AlbumInfo.tsx
import React,{useState,useEffect} from 'react';
import {
  View,Text,Image,FlatList,StyleSheet,TouchableOpacity,
  ScrollView,ActivityIndicator,Alert
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRoute,useNavigation} from '@react-navigation/native';
import {useToken} from '../context/TokenContext';

interface RouteParams { id:string; name:string }
interface AlbumDetail { images:{url:string}[]; artists:{name:string}[]; release_date:string }
interface Track { id:string; name:string }

const AlbumInfo:React.FC=()=>{
  const route=useRoute();
  const nav=useNavigation();
  const {id,name}=route.params as RouteParams;
  const {token}=useToken();

  const [album,setAlbum]=useState<AlbumDetail|null>(null);
  const [tracks,setTracks]=useState<Track[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!id||!token?.access_token) return;
    setLoading(true);
    (async()=>{
      try{
        const [rAlb,rTr]=await Promise.all([
          fetch(`https://api.spotify.com/v1/albums/${id}`,{headers:{Authorization:`Bearer ${token.access_token}`}}),
          fetch(`https://api.spotify.com/v1/albums/${id}/tracks`,{headers:{Authorization:`Bearer ${token.access_token}`}})
        ]);
        if(!rAlb.ok||!rTr.ok) throw new Error();
        const alb=await rAlb.json();
        const tr =await rTr.json();
        setAlbum(alb);
        setTracks(tr.items);
      }catch(e){
        console.error(e);
        Alert.alert('Error','No se cargó el álbum.');
      }finally{setLoading(false);}
    })();
  },[id,token]);

  if(loading) return <View style={s.loader}><ActivityIndicator size="large" color="#f05858"/></View>;
  if(!album) return <View style={s.loader}><Text style={s.error}>Álbum no encontrado.</Text></View>;

  const year=album.release_date.slice(0,4);
  const renderSong=({item}:{item:Track})=>(<View style={s.songItem}><Text style={s.songText}>{item.name}</Text></View>);

  return (
    <ScrollView style={s.container}>
      <TouchableOpacity style={s.back} onPress={()=>nav.goBack()}><Ionicons name="arrow-back" size={30} color="#fff"/></TouchableOpacity>
      <View style={s.header}>
        {album.images[0] ? <Image style={s.image} source={{uri:album.images[0].url}}/> : <Text style={s.noImg}>No image</Text>}
        <View style={s.info}>
          <Text style={s.name}>{name}</Text>
          <Text style={s.artist}>Artist: {album.artists.map(a=>a.name).join(', ')}</Text>
          <Text style={s.year}>Year: {year}</Text>
        </View>
      </View>
      <View style={s.list}>
        <FlatList data={tracks} renderItem={renderSong} keyExtractor={i=>i.id}/>
      </View>
    </ScrollView>
  );
};

const s=StyleSheet.create({
  container:{flex:1,backgroundColor:'#121212',padding:10},
  loader:{flex:1,justifyContent:'center',alignItems:'center'},
  error:{color:'red'},
  back:{position:'absolute',top:20,left:20,zIndex:1},
  header:{flexDirection:'row',marginTop:50,backgroundColor:'#1A1A1A',borderRadius:10,padding:20,alignItems:'center'},
  image:{width:160,height:160,borderRadius:8},
  noImg:{color:'#fff',fontStyle:'italic'},
  info:{flex:1,marginLeft:20},
  name:{fontSize:28,fontWeight:'bold',color:'#f05858',marginBottom:5},
  artist:{fontSize:18,color:'#fff',marginBottom:5},
  year:{fontSize:16,color:'#bbb'},
  list:{backgroundColor:'#1A1A1A',borderRadius:10,padding:20,marginTop:20,borderColor:'#f05858',borderWidth:0.5},
  songItem:{padding:10,borderBottomWidth:1,borderBottomColor:'#333'},
  songText:{color:'#fff'}
});

export default AlbumInfo;

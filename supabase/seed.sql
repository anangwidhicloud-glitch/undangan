-- Realistic Indonesian demo content. Safe to run repeatedly.
begin;

insert into public.weddings (id, slug, title, groom_name, bride_name, event_date, timezone, status, theme_config, seo_config)
values (
  '11111111-1111-4111-8111-111111111111',
  'nathan-dan-aulia',
  'Pernikahan Nathan & Aulia',
  'Nathan Pratama',
  'Aulia Rahma',
  '2027-07-17 09:00:00+07',
  'Asia/Jakarta',
  'published',
  '{"preset":"luxury-gold","layoutPreset":"cinematic-editorial","coverStyle":"curtain","navigationStyle":"floating-dock","galleryStyle":"masonry","storyStyle":"cinematic","primary":"#1d1f19","secondary":"#f5f0e6","accent":"#c2a25b","text":"#292922","surface":"#fffaf0","muted":"#746c5d","headingFont":"Cormorant Garamond","bodyFont":"Manrope","mode":"light","animationIntensity":"high","layoutStyle":"editorial","ornamentStyle":"gold-lines","heroStyle":"cinematic","surfaceStyle":"glass","cornerStyle":"soft"}',
  '{"title":"Undangan Pernikahan Nathan & Aulia","description":"Dengan penuh kebahagiaan, Nathan dan Aulia mengundang Anda untuk hadir pada hari pernikahan kami.","imageUrl":"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=85"}'
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  groom_name = excluded.groom_name,
  bride_name = excluded.bride_name,
  event_date = excluded.event_date,
  status = excluded.status,
  theme_config = excluded.theme_config,
  seo_config = excluded.seo_config;

insert into public.couples (id, wedding_id, role, full_name, nickname, parent_names, photo_url, instagram_url, description, sort_order) values
('21111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','groom','Nathan Pratama, S.T.','Nathan','Putra pertama Bapak Arif Pratama & Ibu Dina Maharani','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85','https://instagram.com/','Sosok tenang yang percaya bahwa rumah terbaik adalah tempat dua orang saling bertumbuh.',1),
('21111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','bride','Aulia Rahma, S.Psi.','Aulia','Putri kedua Bapak Hendra Saputra & Ibu Ratna Wulandari','https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85','https://instagram.com/','Pribadi hangat yang menemukan bahagia dalam keluarga, doa, dan cerita sederhana.',2)
on conflict (id) do update set full_name=excluded.full_name, nickname=excluded.nickname, parent_names=excluded.parent_names, photo_url=excluded.photo_url, description=excluded.description;

insert into public.events (id,wedding_id,event_type,title,event_date,start_time,end_time,timezone,venue_name,address,latitude,longitude,google_maps_url,dress_code,notes,sort_order) values
('31111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','akad','Akad Nikah','2027-07-17','09:00','10:30','Asia/Jakarta','Pendopo Arunika','Jl. Taman Bahagia No. 17, Jakarta Selatan, DKI Jakarta',-6.2615000,106.8106000,'https://maps.google.com/?q=-6.2615,106.8106','Formal bernuansa earth tone','Mohon hadir 30 menit sebelum acara dimulai.',1),
('31111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','resepsi','Resepsi Pernikahan','2027-07-17','11:00','14:00','Asia/Jakarta','Pendopo Arunika','Jl. Taman Bahagia No. 17, Jakarta Selatan, DKI Jakarta',-6.2615000,106.8106000,'https://maps.google.com/?q=-6.2615,106.8106','Batik atau busana formal','Area parkir tersedia di sisi timur gedung.',2)
on conflict (id) do update set title=excluded.title,event_date=excluded.event_date,start_time=excluded.start_time,end_time=excluded.end_time,venue_name=excluded.venue_name,address=excluded.address;

insert into public.love_stories (id,wedding_id,title,story,story_date,image_url,sort_order) values
('41111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Pertama Bertemu','Sebuah pertemuan singkat di acara sahabat berubah menjadi percakapan yang tidak ingin segera diakhiri.','2021-08-21','https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=84',1),
('41111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','Mulai Berkomitmen','Kami belajar bahwa hubungan bukan tentang selalu sepakat, melainkan tetap memilih saling memahami.','2022-02-12','https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=84',2),
('41111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','Lamaran','Di hadapan keluarga, kami mengikat niat baik dan memohon restu untuk melangkah ke jenjang berikutnya.','2026-11-15','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=84',3),
('41111111-1111-4111-8111-111111111114','11111111-1111-4111-8111-111111111111','Hari Pernikahan','Dengan penuh syukur, kami akan memulai babak baru sebagai keluarga.','2027-07-17','https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=84',4)
on conflict (id) do update set title=excluded.title,story=excluded.story,story_date=excluded.story_date,image_url=excluded.image_url,sort_order=excluded.sort_order;

insert into public.media (id,wedding_id,media_type,url,thumbnail_url,caption,alt_text,is_featured,orientation,sort_order) values
('51111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','image','https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=82',null,'Satu cerita','Foto prewedding Nathan dan Aulia 1',true,'horizontal',1),
('51111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','image','https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=82',null,'Tawa yang sama','Foto prewedding Nathan dan Aulia 2',false,'vertical',2),
('51111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','image','https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=82',null,'Langkah bersama','Foto prewedding Nathan dan Aulia 3',false,'horizontal',3),
('51111111-1111-4111-8111-111111111114','11111111-1111-4111-8111-111111111111','image','https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=82',null,'Dalam doa','Foto prewedding Nathan dan Aulia 4',false,'vertical',4),
('51111111-1111-4111-8111-111111111115','11111111-1111-4111-8111-111111111111','image','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=82',null,'Menuju rumah','Foto prewedding Nathan dan Aulia 5',false,'horizontal',5),
('51111111-1111-4111-8111-111111111116','11111111-1111-4111-8111-111111111111','image','https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=82',null,'Selamanya','Foto prewedding Nathan dan Aulia 6',false,'horizontal',6),
('51111111-1111-4111-8111-111111111117','11111111-1111-4111-8111-111111111111','video','/video/wedding-demo.mp4','/images/video-poster.svg','Wedding Film','Video perjalanan Nathan dan Aulia',false,'horizontal',7),
('51111111-1111-4111-8111-111111111118','11111111-1111-4111-8111-111111111111','audio','/audio/wedding-demo.mp3',null,'Wedding Chime — Demo Audio','Musik latar undangan',false,null,8)
on conflict (id) do update set url=excluded.url,caption=excluded.caption,alt_text=excluded.alt_text,sort_order=excluded.sort_order;

insert into public.gift_accounts (id,wedding_id,gift_type,bank_name,account_number,account_holder,sort_order) values
('61111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','bank','Bank Central Asia','1234567890','Nathan Pratama',1),
('61111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','bank','Bank Syariah Indonesia','7890123456','Aulia Rahma',2)
on conflict (id) do update set bank_name=excluded.bank_name,account_number=excluded.account_number,account_holder=excluded.account_holder;

insert into public.guests (id,wedding_id,name,greeting,phone,guest_group,invitation_quota,slug,token,invitation_status,rsvp_status,notes) values
('71111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Bapak Andi dan Keluarga','Bapak/Ibu','6281234567801','Keluarga',4,'bapak-andi-keluarga','tok-demo-1','sudah_dikirim','hadir','Keluarga besar'),
('71111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','Siti Maharani','Saudari','6281234567802','Sahabat',2,'siti-maharani','tok-demo-2','sudah_dikirim','ragu','Teman kuliah'),
('71111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','Rizky Hidayat','Saudara','6281234567803','Kantor',1,'rizky-hidayat','tok-demo-3','belum_dikirim','belum','Tim kantor'),
('71111111-1111-4111-8111-111111111114','11111111-1111-4111-8111-111111111111','Keluarga Besar Wijaya','Bapak/Ibu','6281234567804','Keluarga',5,'keluarga-besar-wijaya','tok-demo-4','sudah_dikirim','tidak_hadir','Kerabat luar kota'),
('71111111-1111-4111-8111-111111111115','11111111-1111-4111-8111-111111111111','Dewi Lestari','Saudari','6281234567805','Sahabat',2,'dewi-lestari','tok-demo-5','belum_dikirim','belum','Sahabat Aulia')
on conflict (id) do update set name=excluded.name,phone=excluded.phone,guest_group=excluded.guest_group,rsvp_status=excluded.rsvp_status;

insert into public.rsvps (id,wedding_id,guest_id,guest_name,attendance_status,guest_count,phone,message) values
('81111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111111','Bapak Andi dan Keluarga','hadir',4,'6281234567801','Insyaallah kami hadir.'),
('81111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111112','Siti Maharani','ragu',2,'6281234567802','Semoga bisa hadir di hari bahagia kalian.'),
('81111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111114','Keluarga Besar Wijaya','tidak_hadir',0,'6281234567804','Mohon maaf belum dapat hadir.')
on conflict (id) do update set attendance_status=excluded.attendance_status,guest_count=excluded.guest_count,message=excluded.message;

insert into public.guest_messages (id,wedding_id,guest_id,guest_name,message,attendance_status,is_approved) values
('91111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111112','Siti Maharani','Semoga menjadi keluarga yang penuh sakinah, mawaddah, dan rahmah.','hadir',true),
('91111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111114','Keluarga Wijaya','Selamat menempuh hidup baru. Semoga selalu saling menjaga dalam suka dan duka.','tidak_hadir',true),
('91111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','71111111-1111-4111-8111-111111111113','Rizky Hidayat','Turut berbahagia untuk Nathan dan Aulia. Sampai bertemu di hari bahagia!','ragu',true)
on conflict (id) do update set message=excluded.message,attendance_status=excluded.attendance_status,is_approved=excluded.is_approved;

insert into public.site_settings (wedding_id,setting_key,setting_value) values
('11111111-1111-4111-8111-111111111111','quote','"Di antara banyak langkah dalam hidup, kami memilih berjalan pulang menuju satu sama lain."'::jsonb),
('11111111-1111-4111-8111-111111111111','thank_you_message','"Kehadiran dan doa restu Anda menjadi hadiah paling bermakna dalam perjalanan baru kami."'::jsonb),
('11111111-1111-4111-8111-111111111111','past_event_message','"Hari bahagia kami telah berlangsung. Terima kasih telah menjadi bagian dari cerita ini."'::jsonb),
('11111111-1111-4111-8111-111111111111','hero_image_url','"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=85"'::jsonb),
('11111111-1111-4111-8111-111111111111','music_title','"Wedding Chime — Demo Audio"'::jsonb),
('11111111-1111-4111-8111-111111111111','whatsapp_template','"Assalamu’alaikum Bapak/Ibu/Saudara/i [Nama Tamu]. Tanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan kami. Silakan membuka undangan melalui tautan berikut: [Link Undangan]"'::jsonb)
on conflict (wedding_id,setting_key) do update set setting_value=excluded.setting_value;

commit;

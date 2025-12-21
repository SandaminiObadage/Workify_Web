import { Menu, rem, Avatar, Switch, Badge } from '@mantine/core';
import {
    IconMessageCircle,
    IconLogout2,
    IconUserCircle,
    IconFileText,
    IconSun,
    IconMoonStars,
    IconMoon,
    IconShieldCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeUser } from '../../Slices/UserSlice';
import { removeJwt } from '../../Slices/JwtSlice';

const ProfileMenu = () => {
    const user=useSelector((state:any)=>state.user);
    const profile=useSelector((state:any)=>state.profile);
    const [opened, setOpened] = useState(false);
    const [checked, setChecked] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAdmin = user?.accountType === 'ADMIN';
    
    const handleLogout=()=>{
        dispatch(removeUser());
        dispatch(removeJwt());
        navigate('/');
    }
    return (
        <Menu shadow="md" width={200} opened={opened} onChange={setOpened}>
            <Menu.Target><div className="flex items-center gap-2 cursor-pointer">
                <div className='xs-mx:hidden flex items-center gap-2'>
                    {user.name}
                    {isAdmin && <Badge size="xs" color="brightSun.4" variant="filled">Admin</Badge>}
                </div>
                <Avatar src={profile?.picture?`data:image/jpeg;base64,${profile.picture}`:'/avatar.png'} alt="it's me" />
            </div>
            </Menu.Target>

            <Menu.Dropdown onChange={()=>setOpened(true)}>
                {isAdmin && (
                    <Link to="/admin">
                        <Menu.Item leftSection={<IconShieldCheck style={{ width: rem(14), height: rem(14) }} />}>
                            Admin Dashboard
                        </Menu.Item>
                    </Link>
                )}
                <Link to="/profile">
                <Menu.Item  leftSection={<IconUserCircle style={{ width: rem(14), height: rem(14) }} />}>
                    Profile
                </Menu.Item>
                </Link>
                <Menu.Item leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}>
                    Messages
                </Menu.Item>
                <Menu.Item leftSection={<IconFileText style={{ width: rem(14), height: rem(14) }} />}>
                    Resume
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconMoon style={{ width: rem(14), height: rem(14) }} />}
                    rightSection={
                        <Switch size="sm" color="dark" className='cursor-pointer'
                            onLabel={<IconSun
                                style={{ width: rem(14), height: rem(14) }}
                                stroke={2.5}
                                color="yellow"
                            />} offLabel={<IconMoonStars
                                style={{ width: rem(14), height: rem(14) }}
                                stroke={2.5}
                                color="cyan"
                            />}
                            checked={checked}
                            onChange={(event) => setChecked(event.currentTarget.checked)}
                        />
                    }
                >
                    Dark Mode
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item onClick={handleLogout}
                    color="red"
                    leftSection={<IconLogout2 style={{ width: rem(14), height: rem(14) }} />}
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
export default ProfileMenu;
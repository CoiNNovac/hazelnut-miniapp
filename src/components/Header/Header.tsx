import {TonConnectButton} from "@tonconnect/ui-react";
import './header.scss';
import {Balance} from "../Balance/Balance";

export const Header = () => {
    return <header>
        <span>My App with React UI</span>
        <div className="header-right">
            <Balance />
            <TonConnectButton />
        </div>
    </header>
}
